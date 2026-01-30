const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
// Dynamic import for fetch since we are in a CommonJS environment but node-fetch v3 is ESM
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// 1. Read .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = {};

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            envConfig[key.trim()] = value.trim();
        }
    });
}

const SUPABASE_URL = envConfig['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_SERVICE_ROLE_KEY = envConfig['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Error: Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const GRAPHQL_URL = 'https://leetcode.com/graphql';
const ALL_PROBLEMS_URL = 'https://leetcode.com/api/problems/algorithms/';
const LIMIT = 600; // Target number of questions to add

const QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId
      title
      titleSlug
      content
      difficulty
      exampleTestcases
      topicTags {
        name
        slug
      }
      codeSnippets {
        lang
        langSlug
        code
      }
      stats
    }
  }
`;

function stripHtml(html) {
    return html.replace(/<[^>]*>?/gm, '');
}

async function fetchProblemSlugs() {
    try {
        process.stdout.write('⏳ Fetching global problem list from LeetCode... ');
        const f = await fetch;
        const response = await f(ALL_PROBLEMS_URL);
        const data = await response.json();

        // customizable filter: free questions only
        const allProblems = data.stat_status_pairs
            .filter(p => !p.paid_only);

        // Sort by Question ID (asc) to get the "classics" (Twosum, etc)
        allProblems.sort((a, b) => a.stat.question_id - b.stat.question_id);

        console.log(`OK (${allProblems.length} available)`);
        return allProblems.slice(0, LIMIT).map(p => p.stat.question__title_slug);
    } catch (error) {
        console.error('\n❌ Error fetching problem list:', error.message);
        return [];
    }
}

async function fetchLeetCodeData(slug) {
    try {
        const f = await fetch;
        const response = await f(GRAPHQL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Node.js)' // generic UA to avoid blocks
            },
            body: JSON.stringify({
                query: QUERY,
                variables: { titleSlug: slug }
            })
        });

        const body = await response.json();
        if (body.errors) {
            // Some problems might be locked or have issues
            // console.error(`⚠️ GraphQL Error for ${slug}:`, body.errors[0].message);
            return null;
        }
        return body.data.question;
    } catch (error) {
        console.error(`❌ Network Error for ${slug}:`, error.message);
        return null;
    }
}

async function main() {
    console.log('🚀 Starting Expanded LeetCode Scraper (Target: 600 questions)...');

    // 1. Get List dynamically
    const slugs = await fetchProblemSlugs();

    if (slugs.length === 0) {
        console.error("No slugs found. Exiting.");
        return;
    }

    const problems = [];

    // 2. Fetch details for each
    for (let i = 0; i < slugs.length; i++) {
        const slug = slugs[i];
        process.stdout.write(`⏳ Processing [${i + 1}/${slugs.length}]: ${slug}... `);

        // Check availability locally or skip if we want resume capability (not implemented here for simplicity)

        const data = await fetchLeetCodeData(slug);

        if (!data) {
            console.log('SKIPPED (Locked/Error)');
            continue;
        }

        const starterCode = {};
        if (data.codeSnippets) {
            data.codeSnippets.forEach(snip => {
                if (snip.langSlug === 'javascript') starterCode['javascript'] = snip.code;
                if (snip.langSlug === 'python3') starterCode['python'] = snip.code;
                if (snip.langSlug === 'cpp') starterCode['cpp'] = snip.code;
                if (snip.langSlug === 'java') starterCode['java'] = snip.code;
            });
        }

        const problem = {
            title: data.title,
            slug: data.titleSlug,
            difficulty: data.difficulty.toUpperCase(),
            category: data.topicTags.length > 0 ? data.topicTags[0].name : 'Algorithms',
            description: stripHtml(data.content).slice(0, 1500) + (data.content.length > 1500 ? "..." : ""),
            time_limit_ms: 1000,
            memory_limit_mb: 256,
            sample_input: data.exampleTestcases ? data.exampleTestcases.split('\n')[0] : '',
            sample_output: '',
            starter_code: starterCode
        };

        problems.push(problem);
        console.log('OK');

        // Rate limit protection
        await new Promise(r => setTimeout(r, 600));

        // 3. Incremental Batch Upload every 50 questions
        // This prevents losing all progress if script crashes at #599
        if (problems.length % 50 === 0) {
            await uploadBatch(problems.slice(problems.length - 50));
        }
    }

    // Upload remaining
    if (problems.length % 50 !== 0) {
        const remaining = problems.length % 50;
        await uploadBatch(problems.slice(problems.length - remaining));
    }

    console.log('✨ All Done!');
}

async function uploadBatch(chunk) {
    console.log(`\n📦 Uploading batch of ${chunk.length} problems...`);
    const { error } = await supabase
        .from('problems')
        .upsert(chunk, { onConflict: 'slug' });

    if (error) {
        console.error(`❌ Upload Error: ${error.message}`);
    } else {
        console.log(`✅ Batch synced successfully.`);
    }
}

main();

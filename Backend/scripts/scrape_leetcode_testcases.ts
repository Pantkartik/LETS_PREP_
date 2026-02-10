/**
 * LeetCode Test Case Scraper
 * 
 * This script scrapes test cases from LeetCode problem pages.
 * 
 * Usage:
 * 1. Install dependencies: npm install axios cheerio
 * 2. Run: npx ts-node scripts/scrape_leetcode_testcases.ts
 * 
 * Note: LeetCode may block automated requests. Use responsibly.
 */

import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface LeetCodeProblem {
    titleSlug: string;
    sampleTestCase: string;
}

/**
 * Fetch problem data from LeetCode GraphQL API
 */
async function fetchLeetCodeProblem(titleSlug: string): Promise<LeetCodeProblem | null> {
    try {
        const response = await axios.post('https://leetcode.com/graphql', {
            query: `
                query questionData($titleSlug: String!) {
                    question(titleSlug: $titleSlug) {
                        questionId
                        title
                        titleSlug
                        content
                        difficulty
                        exampleTestcases
                        sampleTestCase
                    }
                }
            `,
            variables: { titleSlug }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        });

        return response.data.data.question;
    } catch (error: any) {
        console.error(`Failed to fetch ${titleSlug}:`, error.message);
        return null;
    }
}

/**
 * Parse LeetCode test case format to our format
 */
function parseLeetCodeTestCase(sampleTestCase: string, exampleTestcases: string): any[] {
    // LeetCode format: "input1\ninput2\ninput3"
    // We need to convert to our format: { input: "...", expectedOutput: "..." }

    const lines = sampleTestCase.split('\n');

    // This is a simplified parser - you'll need to customize based on problem type
    return [{
        input: lines[0] || '',
        expectedOutput: '', // You'll need to run the solution to get this
        isHidden: false
    }];
}

/**
 * Main scraper function
 */
async function scrapeLeetCodeTestCases() {
    console.log('🚀 Starting LeetCode Test Case Scraper...\n');

    // Fetch all problems from our database
    const { data: problems, error } = await supabase
        .from('problems')
        .select('id, slug, title');

    if (error || !problems) {
        console.error('Failed to fetch problems:', error);
        return;
    }

    for (const problem of problems) {
        console.log(`Scraping ${problem.slug}...`);

        // Convert our slug to LeetCode slug format
        const leetcodeSlug = problem.slug;

        const leetcodeProblem = await fetchLeetCodeProblem(leetcodeSlug);

        if (leetcodeProblem && leetcodeProblem.sampleTestCase) {
            const testCases = parseLeetCodeTestCase(
                leetcodeProblem.sampleTestCase,
                (leetcodeProblem as any).exampleTestcases
            );

            // Update database
            const { error: updateError } = await supabase
                .from('problems')
                .update({ test_cases: testCases })
                .eq('id', problem.id);

            if (updateError) {
                console.error(`❌ Failed to update ${problem.slug}:`, updateError.message);
            } else {
                console.log(`✅ Updated ${problem.slug}`);
            }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n✅ Scraping complete!');
}

// Uncomment to run
// scrapeLeetCodeTestCases().catch(console.error);

console.log(`
⚠️  LeetCode Scraper Notes:
1. This script requires 'axios' package: npm install axios
2. LeetCode may block automated requests - use with caution
3. You may need to add authentication cookies for private problems
4. The parser is simplified - customize based on your problem types

Recommended Approach:
- Use the manual test case generator (generate_testcases.ts) for now
- Add test cases incrementally as you create problems
- Consider using LeetCode's official API if available
`);

export { scrapeLeetCodeTestCases };

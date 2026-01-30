const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

// 2. Initialize Supabase Admin Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function seedProblems() {
    const dataPath = path.resolve(__dirname, 'problems_data.json');

    if (!fs.existsSync(dataPath)) {
        console.error(`❌ Error: Data file not found at ${dataPath}`);
        console.log('💡 Tip: Create "problems_data.json" in the scripts folder with your question data.');
        process.exit(1);
    }

    const rawData = fs.readFileSync(dataPath, 'utf8');
    let problems;

    try {
        problems = JSON.parse(rawData);
    } catch (e) {
        console.error('❌ Error parsing JSON:', e.message);
        process.exit(1);
    }

    if (!Array.isArray(problems) || problems.length === 0) {
        console.error('❌ Error: JSON must be an array of problem objects.');
        process.exit(1);
    }

    console.log(`🚀 Starting seed of ${problems.length} problems...`);

    // 3. Batch Insert (Chunking to avoid payload limits)
    const CHUNK_SIZE = 50;
    for (let i = 0; i < problems.length; i += CHUNK_SIZE) {
        const chunk = problems.slice(i, i + CHUNK_SIZE);

        // Ensure all required fields (simple validation)
        const validChunk = chunk.map(p => ({
            title: p.title,
            slug: p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            difficulty: p.difficulty || 'MEDIUM',
            category: p.category || 'General',
            description: p.description || '',
            time_limit_ms: p.time_limit_ms || 1000,
            memory_limit_mb: p.memory_limit_mb || 256,
            sample_input: p.sample_input || '',
            sample_output: p.sample_output || '',
            starter_code: p.starter_code || {}
        }));

        const { error } = await supabase
            .from('problems')
            .upsert(validChunk, { onConflict: 'slug' });

        if (error) {
            console.error(`❌ Error inserting chunk ${i / CHUNK_SIZE + 1}:`, error.message);
        } else {
            console.log(`✅ Inserted/Updated problems ${i + 1} to ${Math.min(i + CHUNK_SIZE, problems.length)}`);
        }
    }

    console.log('✨ Seeding complete!');
}

seedProblems();

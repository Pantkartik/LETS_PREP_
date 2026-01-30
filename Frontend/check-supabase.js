// Supabase Configuration Checker
// Run this with: node check-supabase.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Supabase Configuration...\n');

// Check .env.local file
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    console.log('✅ .env.local file exists');
    const envContent = fs.readFileSync(envPath, 'utf8');

    const hasUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=');
    const hasAnonKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=');
    const hasServiceRole = envContent.includes('SUPABASE_SERVICE_ROLE_KEY=');

    console.log(hasUrl ? '✅ NEXT_PUBLIC_SUPABASE_URL is set' : '❌ NEXT_PUBLIC_SUPABASE_URL is missing');
    console.log(hasAnonKey ? '✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set' : '❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
    console.log(hasServiceRole ? '✅ SUPABASE_SERVICE_ROLE_KEY is set' : '❌ SUPABASE_SERVICE_ROLE_KEY is missing');
} else {
    console.log('❌ .env.local file not found');
}

console.log('\n📁 Checking file structure...');

// Check required files
const requiredFiles = [
    'lib/supabase-client.ts',
    'lib/supabase-server.ts',
    'app/login/page.tsx',
    'app/signup/page.tsx',
    'middleware.ts',
    'supabase/schema.sql'
];

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} not found`);
    }
});

console.log('\n📝 Next Steps:');
console.log('1. Run the database schema in Supabase Dashboard');
console.log('2. Restart your dev server: npm run dev');
console.log('3. Test signup at: http://localhost:3000/signup');
console.log('\n✨ Configuration check complete!');

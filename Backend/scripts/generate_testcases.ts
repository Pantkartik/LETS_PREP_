import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Test Case Generator
 * 
 * This script generates comprehensive test cases for problems that don't have them.
 * 
 * For each problem, we need:
 * - input: string (formatted for stdin)
 * - expectedOutput: string (formatted for stdout comparison)
 * - isHidden: boolean (whether to show to user)
 */

interface TestCase {
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
}

// Comprehensive test cases for common problems
const problemTestCases: Record<string, TestCase[]> = {
    'two-sum': [
        { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
        { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: false },
        { input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: false },
        { input: '[0,4,3,0]\n0', expectedOutput: '[0,3]', isHidden: true },
        { input: '[-3,4,3,90]\n0', expectedOutput: '[0,2]', isHidden: true }
    ],
    'reverse-string': [
        { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]', isHidden: false },
        { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]', isHidden: false },
        { input: '["A"," ","b","a","n","a","n","a"]', expectedOutput: '["a","n","a","n","a","b"," ","A"]', isHidden: true }
    ],
    'fibonacci-number': [
        { input: '2', expectedOutput: '1', isHidden: false },
        { input: '3', expectedOutput: '2', isHidden: false },
        { input: '4', expectedOutput: '3', isHidden: false },
        { input: '30', expectedOutput: '832040', isHidden: true },
        { input: '0', expectedOutput: '0', isHidden: true }
    ],
    'find-k-closest-elements': [
        { input: '[1,2,3,4,5]\n4\n3', expectedOutput: '[1,2,3,4]', isHidden: false },
        { input: '[1,2,3,4,5]\n4\n-1', expectedOutput: '[1,2,3,4]', isHidden: false },
        { input: '[1,1,1,10,10,10]\n1\n9', expectedOutput: '[10]', isHidden: true }
    ],
    'valid-parentheses': [
        { input: '()', expectedOutput: 'true', isHidden: false },
        { input: '()[]{}', expectedOutput: 'true', isHidden: false },
        { input: '(]', expectedOutput: 'false', isHidden: false },
        { input: '([)]', expectedOutput: 'false', isHidden: true },
        { input: '{[]}', expectedOutput: 'true', isHidden: true }
    ],
    'merge-two-sorted-lists': [
        { input: '[1,2,4]\n[1,3,4]', expectedOutput: '[1,1,2,3,4,4]', isHidden: false },
        { input: '[]\n[]', expectedOutput: '[]', isHidden: false },
        { input: '[]\n[0]', expectedOutput: '[0]', isHidden: true }
    ]
};

async function updateTestCases() {
    console.log('🚀 Starting Test Case Generation...\n');

    for (const [slug, testCases] of Object.entries(problemTestCases)) {
        console.log(`Updating ${slug}...`);

        const { data, error } = await supabase
            .from('problems')
            .update({ test_cases: testCases })
            .eq('slug', slug);

        if (error) {
            console.error(`❌ Failed to update ${slug}:`, error.message);
        } else {
            console.log(`✅ Updated ${slug} with ${testCases.length} test cases`);
        }
    }

    console.log('\n✅ Test case generation complete!');
}

async function verifyTestCases() {
    console.log('\n🔍 Verifying test cases...\n');

    const { data: problems, error } = await supabase
        .from('problems')
        .select('slug, test_cases');

    if (error) {
        console.error('❌ Failed to fetch problems:', error.message);
        return;
    }

    problems?.forEach(problem => {
        const testCases = problem.test_cases || [];
        console.log(`${problem.slug}: ${testCases.length} test cases`);
    });
}

// Run the script
updateTestCases()
    .then(() => verifyTestCases())
    .catch(console.error);

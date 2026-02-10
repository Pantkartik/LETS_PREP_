import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TestCase {
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
}

// Comprehensive test cases for ALL problems
const allTestCases: Record<string, TestCase[]> = {
    // EASY PROBLEMS
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
        { input: '["a"]', expectedOutput: '["a"]', isHidden: false },
        { input: '["A"," ","b","a","n","a","n","a"]', expectedOutput: '["a","n","a","n","a","b"," ","A"]', isHidden: true }
    ],

    'fibonacci-number': [
        { input: '2', expectedOutput: '1', isHidden: false },
        { input: '3', expectedOutput: '2', isHidden: false },
        { input: '4', expectedOutput: '3', isHidden: false },
        { input: '0', expectedOutput: '0', isHidden: false },
        { input: '30', expectedOutput: '832040', isHidden: true },
        { input: '1', expectedOutput: '1', isHidden: true }
    ],

    'valid-parentheses': [
        { input: '()', expectedOutput: 'true', isHidden: false },
        { input: '()[]{}', expectedOutput: 'true', isHidden: false },
        { input: '(]', expectedOutput: 'false', isHidden: false },
        { input: '([)]', expectedOutput: 'false', isHidden: true },
        { input: '{[]}', expectedOutput: 'true', isHidden: true },
        { input: '((', expectedOutput: 'false', isHidden: true }
    ],

    'palindrome-number': [
        { input: '121', expectedOutput: 'true', isHidden: false },
        { input: '-121', expectedOutput: 'false', isHidden: false },
        { input: '10', expectedOutput: 'false', isHidden: false },
        { input: '0', expectedOutput: 'true', isHidden: true },
        { input: '12321', expectedOutput: 'true', isHidden: true }
    ],

    'merge-two-sorted-lists': [
        { input: '[1,2,4]\n[1,3,4]', expectedOutput: '[1,1,2,3,4,4]', isHidden: false },
        { input: '[]\n[]', expectedOutput: '[]', isHidden: false },
        { input: '[]\n[0]', expectedOutput: '[0]', isHidden: false },
        { input: '[1]\n[2]', expectedOutput: '[1,2]', isHidden: true }
    ],

    'maximum-subarray': [
        { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', isHidden: false },
        { input: '[1]', expectedOutput: '1', isHidden: false },
        { input: '[5,4,-1,7,8]', expectedOutput: '23', isHidden: false },
        { input: '[-1]', expectedOutput: '-1', isHidden: true },
        { input: '[-2,-1]', expectedOutput: '-1', isHidden: true }
    ],

    'climbing-stairs': [
        { input: '2', expectedOutput: '2', isHidden: false },
        { input: '3', expectedOutput: '3', isHidden: false },
        { input: '1', expectedOutput: '1', isHidden: false },
        { input: '5', expectedOutput: '8', isHidden: true },
        { input: '45', expectedOutput: '1836311903', isHidden: true }
    ],

    'best-time-to-buy-and-sell-stock': [
        { input: '[7,1,5,3,6,4]', expectedOutput: '5', isHidden: false },
        { input: '[7,6,4,3,1]', expectedOutput: '0', isHidden: false },
        { input: '[1,2]', expectedOutput: '1', isHidden: false },
        { input: '[2,4,1]', expectedOutput: '2', isHidden: true }
    ],

    'single-number': [
        { input: '[2,2,1]', expectedOutput: '1', isHidden: false },
        { input: '[4,1,2,1,2]', expectedOutput: '4', isHidden: false },
        { input: '[1]', expectedOutput: '1', isHidden: false },
        { input: '[1,0,1]', expectedOutput: '0', isHidden: true }
    ],

    // MEDIUM PROBLEMS
    'find-k-closest-elements': [
        { input: '[1,2,3,4,5]\n4\n3', expectedOutput: '[1,2,3,4]', isHidden: false },
        { input: '[1,2,3,4,5]\n4\n-1', expectedOutput: '[1,2,3,4]', isHidden: false },
        { input: '[1,1,1,10,10,10]\n1\n9', expectedOutput: '[10]', isHidden: false },
        { input: '[0,1,2,3,4]\n3\n2', expectedOutput: '[1,2,3]', isHidden: true }
    ],

    'longest-substring-without-repeating-characters': [
        { input: 'abcabcbb', expectedOutput: '3', isHidden: false },
        { input: 'bbbbb', expectedOutput: '1', isHidden: false },
        { input: 'pwwkew', expectedOutput: '3', isHidden: false },
        { input: '', expectedOutput: '0', isHidden: true },
        { input: 'dvdf', expectedOutput: '3', isHidden: true }
    ],

    'add-two-numbers': [
        { input: '[2,4,3]\n[5,6,4]', expectedOutput: '[7,0,8]', isHidden: false },
        { input: '[0]\n[0]', expectedOutput: '[0]', isHidden: false },
        { input: '[9,9,9,9,9,9,9]\n[9,9,9,9]', expectedOutput: '[8,9,9,9,0,0,0,1]', isHidden: true }
    ],

    'container-with-most-water': [
        { input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49', isHidden: false },
        { input: '[1,1]', expectedOutput: '1', isHidden: false },
        { input: '[4,3,2,1,4]', expectedOutput: '16', isHidden: true },
        { input: '[1,2,1]', expectedOutput: '2', isHidden: true }
    ],

    '3sum': [
        { input: '[-1,0,1,2,-1,-4]', expectedOutput: '[[-1,-1,2],[-1,0,1]]', isHidden: false },
        { input: '[0,1,1]', expectedOutput: '[]', isHidden: false },
        { input: '[0,0,0]', expectedOutput: '[[0,0,0]]', isHidden: false },
        { input: '[-2,0,1,1,2]', expectedOutput: '[[-2,0,2],[-2,1,1]]', isHidden: true }
    ],

    'letter-combinations-of-a-phone-number': [
        { input: '23', expectedOutput: '["ad","ae","af","bd","be","bf","cd","ce","cf"]', isHidden: false },
        { input: '', expectedOutput: '[]', isHidden: false },
        { input: '2', expectedOutput: '["a","b","c"]', isHidden: false },
        { input: '234', expectedOutput: '["adg","adh","adi","aeg","aeh","aei","afg","afh","afi","bdg","bdh","bdi","beg","beh","bei","bfg","bfh","bfi","cdg","cdh","cdi","ceg","ceh","cei","cfg","cfh","cfi"]', isHidden: true }
    ],

    'generate-parentheses': [
        { input: '3', expectedOutput: '["((()))","(()())","(())()","()(())","()()()"]', isHidden: false },
        { input: '1', expectedOutput: '["()"]', isHidden: false },
        { input: '2', expectedOutput: '["(())","()()"]', isHidden: true }
    ],

    'permutations': [
        { input: '[1,2,3]', expectedOutput: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]', isHidden: false },
        { input: '[0,1]', expectedOutput: '[[0,1],[1,0]]', isHidden: false },
        { input: '[1]', expectedOutput: '[[1]]', isHidden: false }
    ],

    'rotate-image': [
        { input: '[[1,2,3],[4,5,6],[7,8,9]]', expectedOutput: '[[7,4,1],[8,5,2],[9,6,3]]', isHidden: false },
        { input: '[[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]', expectedOutput: '[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]', isHidden: false }
    ],

    'group-anagrams': [
        { input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["bat"],["nat","tan"],["ate","eat","tea"]]', isHidden: false },
        { input: '[""]', expectedOutput: '[[""]]', isHidden: false },
        { input: '["a"]', expectedOutput: '[["a"]]', isHidden: false }
    ],

    // HARD PROBLEMS
    'median-of-two-sorted-arrays': [
        { input: '[1,3]\n[2]', expectedOutput: '2.0', isHidden: false },
        { input: '[1,2]\n[3,4]', expectedOutput: '2.5', isHidden: false },
        { input: '[]\n[1]', expectedOutput: '1.0', isHidden: true },
        { input: '[2]\n[]', expectedOutput: '2.0', isHidden: true }
    ],

    'merge-k-sorted-lists': [
        { input: '[[1,4,5],[1,3,4],[2,6]]', expectedOutput: '[1,1,2,3,4,4,5,6]', isHidden: false },
        { input: '[]', expectedOutput: '[]', isHidden: false },
        { input: '[[]]', expectedOutput: '[]', isHidden: false }
    ],

    'trapping-rain-water': [
        { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6', isHidden: false },
        { input: '[4,2,0,3,2,5]', expectedOutput: '9', isHidden: false },
        { input: '[4,2,3]', expectedOutput: '1', isHidden: true }
    ],

    'regular-expression-matching': [
        { input: 'aa\na', expectedOutput: 'false', isHidden: false },
        { input: 'aa\na*', expectedOutput: 'true', isHidden: false },
        { input: 'ab\n.*', expectedOutput: 'true', isHidden: false },
        { input: 'aab\nc*a*b', expectedOutput: 'true', isHidden: true }
    ],

    'wildcard-matching': [
        { input: 'aa\na', expectedOutput: 'false', isHidden: false },
        { input: 'aa\n*', expectedOutput: 'true', isHidden: false },
        { input: 'cb\n?a', expectedOutput: 'false', isHidden: false },
        { input: 'adceb\n*a*b', expectedOutput: 'true', isHidden: true }
    ],

    'longest-valid-parentheses': [
        { input: '(()', expectedOutput: '2', isHidden: false },
        { input: ')()())', expectedOutput: '4', isHidden: false },
        { input: '', expectedOutput: '0', isHidden: false },
        { input: '()(())', expectedOutput: '6', isHidden: true }
    ],

    'edit-distance': [
        { input: 'horse\nros', expectedOutput: '3', isHidden: false },
        { input: 'intention\nexecution', expectedOutput: '5', isHidden: false },
        { input: 'a\nb', expectedOutput: '1', isHidden: true }
    ],

    'word-ladder': [
        { input: 'hit\ncog\n["hot","dot","dog","lot","log","cog"]', expectedOutput: '5', isHidden: false },
        { input: 'hit\ncog\n["hot","dot","dog","lot","log"]', expectedOutput: '0', isHidden: false }
    ]
};

async function updateAllTestCases() {
    console.log('🚀 Starting Comprehensive Test Case Update...\n');

    // Fetch all problems
    const { data: problems, error: fetchError } = await supabase
        .from('problems')
        .select('id, slug, title');

    if (fetchError || !problems) {
        console.error('❌ Failed to fetch problems:', fetchError);
        return;
    }

    console.log(`Found ${problems.length} problems in database\n`);

    let updated = 0;
    let skipped = 0;

    for (const problem of problems) {
        const testCases = allTestCases[problem.slug];

        if (testCases) {
            console.log(`Updating ${problem.slug}...`);

            const { error: updateError } = await supabase
                .from('problems')
                .update({ test_cases: testCases })
                .eq('id', problem.id);

            if (updateError) {
                console.error(`  ❌ Failed: ${updateError.message}`);
            } else {
                console.log(`  ✅ Added ${testCases.length} test cases`);
                updated++;
            }
        } else {
            console.log(`⚠️  Skipping ${problem.slug} (no test cases defined)`);
            skipped++;
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  ✅ Updated: ${updated} problems`);
    console.log(`  ⚠️  Skipped: ${skipped} problems`);
    console.log(`  📝 Total: ${problems.length} problems`);
}

updateAllTestCases().catch(console.error);

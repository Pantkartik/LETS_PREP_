-- Comprehensive Test Cases for All Problems
-- Run this in Supabase SQL Editor to add test cases to all problems

-- EASY PROBLEMS

-- Two Sum
UPDATE problems 
SET test_cases = '[
  {"input": "[2,7,11,15]\\n9", "expectedOutput": "[0,1]", "isHidden": false},
  {"input": "[3,2,4]\\n6", "expectedOutput": "[1,2]", "isHidden": false},
  {"input": "[3,3]\\n6", "expectedOutput": "[0,1]", "isHidden": false},
  {"input": "[0,4,3,0]\\n0", "expectedOutput": "[0,3]", "isHidden": true},
  {"input": "[-3,4,3,90]\\n0", "expectedOutput": "[0,2]", "isHidden": true}
]'::JSONB
WHERE slug = 'two-sum';

-- Reverse String
UPDATE problems 
SET test_cases = '[
  {"input": "[\"h\",\"e\",\"l\",\"l\",\"o\"]", "expectedOutput": "[\"o\",\"l\",\"l\",\"e\",\"h\"]", "isHidden": false},
  {"input": "[\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]", "expectedOutput": "[\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]", "isHidden": false},
  {"input": "[\"a\"]", "expectedOutput": "[\"a\"]", "isHidden": false},
  {"input": "[\"A\",\" \",\"b\",\"a\",\"n\",\"a\",\"n\",\"a\"]", "expectedOutput": "[\"a\",\"n\",\"a\",\"n\",\"a\",\"b\",\" \",\"A\"]", "isHidden": true}
]'::JSONB
WHERE slug = 'reverse-string';

-- Fibonacci Number
UPDATE problems 
SET test_cases = '[
  {"input": "2", "expectedOutput": "1", "isHidden": false},
  {"input": "3", "expectedOutput": "2", "isHidden": false},
  {"input": "4", "expectedOutput": "3", "isHidden": false},
  {"input": "0", "expectedOutput": "0", "isHidden": false},
  {"input": "30", "expectedOutput": "832040", "isHidden": true},
  {"input": "1", "expectedOutput": "1", "isHidden": true}
]'::JSONB
WHERE slug = 'fibonacci-number';

-- Valid Parentheses
UPDATE problems 
SET test_cases = '[
  {"input": "()", "expectedOutput": "true", "isHidden": false},
  {"input": "()[]{}", "expectedOutput": "true", "isHidden": false},
  {"input": "(]", "expectedOutput": "false", "isHidden": false},
  {"input": "([)]", "expectedOutput": "false", "isHidden": true},
  {"input": "{[]}", "expectedOutput": "true", "isHidden": true},
  {"input": "((", "expectedOutput": "false", "isHidden": true}
]'::JSONB
WHERE slug = 'valid-parentheses';

-- Palindrome Number
UPDATE problems 
SET test_cases = '[
  {"input": "121", "expectedOutput": "true", "isHidden": false},
  {"input": "-121", "expectedOutput": "false", "isHidden": false},
  {"input": "10", "expectedOutput": "false", "isHidden": false},
  {"input": "0", "expectedOutput": "true", "isHidden": true},
  {"input": "12321", "expectedOutput": "true", "isHidden": true}
]'::JSONB
WHERE slug = 'palindrome-number';

-- Merge Two Sorted Lists
UPDATE problems 
SET test_cases = '[
  {"input": "[1,2,4]\\n[1,3,4]", "expectedOutput": "[1,1,2,3,4,4]", "isHidden": false},
  {"input": "[]\\n[]", "expectedOutput": "[]", "isHidden": false},
  {"input": "[]\\n[0]", "expectedOutput": "[0]", "isHidden": false},
  {"input": "[1]\\n[2]", "expectedOutput": "[1,2]", "isHidden": true}
]'::JSONB
WHERE slug = 'merge-two-sorted-lists';

-- Maximum Subarray
UPDATE problems 
SET test_cases = '[
  {"input": "[-2,1,-3,4,-1,2,1,-5,4]", "expectedOutput": "6", "isHidden": false},
  {"input": "[1]", "expectedOutput": "1", "isHidden": false},
  {"input": "[5,4,-1,7,8]", "expectedOutput": "23", "isHidden": false},
  {"input": "[-1]", "expectedOutput": "-1", "isHidden": true},
  {"input": "[-2,-1]", "expectedOutput": "-1", "isHidden": true}
]'::JSONB
WHERE slug = 'maximum-subarray';

-- Climbing Stairs
UPDATE problems 
SET test_cases = '[
  {"input": "2", "expectedOutput": "2", "isHidden": false},
  {"input": "3", "expectedOutput": "3", "isHidden": false},
  {"input": "1", "expectedOutput": "1", "isHidden": false},
  {"input": "5", "expectedOutput": "8", "isHidden": true},
  {"input": "45", "expectedOutput": "1836311903", "isHidden": true}
]'::JSONB
WHERE slug = 'climbing-stairs';

-- Best Time to Buy and Sell Stock
UPDATE problems 
SET test_cases = '[
  {"input": "[7,1,5,3,6,4]", "expectedOutput": "5", "isHidden": false},
  {"input": "[7,6,4,3,1]", "expectedOutput": "0", "isHidden": false},
  {"input": "[1,2]", "expectedOutput": "1", "isHidden": false},
  {"input": "[2,4,1]", "expectedOutput": "2", "isHidden": true}
]'::JSONB
WHERE slug = 'best-time-to-buy-and-sell-stock';

-- Single Number
UPDATE problems 
SET test_cases = '[
  {"input": "[2,2,1]", "expectedOutput": "1", "isHidden": false},
  {"input": "[4,1,2,1,2]", "expectedOutput": "4", "isHidden": false},
  {"input": "[1]", "expectedOutput": "1", "isHidden": false},
  {"input": "[1,0,1]", "expectedOutput": "0", "isHidden": true}
]'::JSONB
WHERE slug = 'single-number';

-- MEDIUM PROBLEMS

-- Find K Closest Elements
UPDATE problems 
SET test_cases = '[
  {"input": "[1,2,3,4,5]\\n4\\n3", "expectedOutput": "[1,2,3,4]", "isHidden": false},
  {"input": "[1,2,3,4,5]\\n4\\n-1", "expectedOutput": "[1,2,3,4]", "isHidden": false},
  {"input": "[1,1,1,10,10,10]\\n1\\n9", "expectedOutput": "[10]", "isHidden": false},
  {"input": "[0,1,2,3,4]\\n3\\n2", "expectedOutput": "[1,2,3]", "isHidden": true}
]'::JSONB
WHERE slug = 'find-k-closest-elements';

-- Longest Substring Without Repeating Characters
UPDATE problems 
SET test_cases = '[
  {"input": "abcabcbb", "expectedOutput": "3", "isHidden": false},
  {"input": "bbbbb", "expectedOutput": "1", "isHidden": false},
  {"input": "pwwkew", "expectedOutput": "3", "isHidden": false},
  {"input": "", "expectedOutput": "0", "isHidden": true},
  {"input": "dvdf", "expectedOutput": "3", "isHidden": true}
]'::JSONB
WHERE slug = 'longest-substring-without-repeating-characters';

-- Add Two Numbers
UPDATE problems 
SET test_cases = '[
  {"input": "[2,4,3]\\n[5,6,4]", "expectedOutput": "[7,0,8]", "isHidden": false},
  {"input": "[0]\\n[0]", "expectedOutput": "[0]", "isHidden": false},
  {"input": "[9,9,9,9,9,9,9]\\n[9,9,9,9]", "expectedOutput": "[8,9,9,9,0,0,0,1]", "isHidden": true}
]'::JSONB
WHERE slug = 'add-two-numbers';

-- Container With Most Water
UPDATE problems 
SET test_cases = '[
  {"input": "[1,8,6,2,5,4,8,3,7]", "expectedOutput": "49", "isHidden": false},
  {"input": "[1,1]", "expectedOutput": "1", "isHidden": false},
  {"input": "[4,3,2,1,4]", "expectedOutput": "16", "isHidden": true},
  {"input": "[1,2,1]", "expectedOutput": "2", "isHidden": true}
]'::JSONB
WHERE slug = 'container-with-most-water';

-- 3Sum
UPDATE problems 
SET test_cases = '[
  {"input": "[-1,0,1,2,-1,-4]", "expectedOutput": "[[-1,-1,2],[-1,0,1]]", "isHidden": false},
  {"input": "[0,1,1]", "expectedOutput": "[]", "isHidden": false},
  {"input": "[0,0,0]", "expectedOutput": "[[0,0,0]]", "isHidden": false},
  {"input": "[-2,0,1,1,2]", "expectedOutput": "[[-2,0,2],[-2,1,1]]", "isHidden": true}
]'::JSONB
WHERE slug = '3sum';

-- Letter Combinations of a Phone Number
UPDATE problems 
SET test_cases = '[
  {"input": "23", "expectedOutput": "[\"ad\",\"ae\",\"af\",\"bd\",\"be\",\"bf\",\"cd\",\"ce\",\"cf\"]", "isHidden": false},
  {"input": "", "expectedOutput": "[]", "isHidden": false},
  {"input": "2", "expectedOutput": "[\"a\",\"b\",\"c\"]", "isHidden": false}
]'::JSONB
WHERE slug = 'letter-combinations-of-a-phone-number';

-- Generate Parentheses
UPDATE problems 
SET test_cases = '[
  {"input": "3", "expectedOutput": "[\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]", "isHidden": false},
  {"input": "1", "expectedOutput": "[\"()\"]", "isHidden": false},
  {"input": "2", "expectedOutput": "[\"(())\",\"()()\"]", "isHidden": true}
]'::JSONB
WHERE slug = 'generate-parentheses';

-- Permutations
UPDATE problems 
SET test_cases = '[
  {"input": "[1,2,3]", "expectedOutput": "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]", "isHidden": false},
  {"input": "[0,1]", "expectedOutput": "[[0,1],[1,0]]", "isHidden": false},
  {"input": "[1]", "expectedOutput": "[[1]]", "isHidden": false}
]'::JSONB
WHERE slug = 'permutations';

-- Rotate Image
UPDATE problems 
SET test_cases = '[
  {"input": "[[1,2,3],[4,5,6],[7,8,9]]", "expectedOutput": "[[7,4,1],[8,5,2],[9,6,3]]", "isHidden": false},
  {"input": "[[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]", "expectedOutput": "[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]", "isHidden": false}
]'::JSONB
WHERE slug = 'rotate-image';

-- Group Anagrams
UPDATE problems 
SET test_cases = '[
  {"input": "[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", "expectedOutput": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]", "isHidden": false},
  {"input": "[\"\"]", "expectedOutput": "[[\"\"]]", "isHidden": false},
  {"input": "[\"a\"]", "expectedOutput": "[[\"a\"]]", "isHidden": false}
]'::JSONB
WHERE slug = 'group-anagrams';

-- HARD PROBLEMS

-- Median of Two Sorted Arrays
UPDATE problems 
SET test_cases = '[
  {"input": "[1,3]\\n[2]", "expectedOutput": "2.0", "isHidden": false},
  {"input": "[1,2]\\n[3,4]", "expectedOutput": "2.5", "isHidden": false},
  {"input": "[]\\n[1]", "expectedOutput": "1.0", "isHidden": true},
  {"input": "[2]\\n[]", "expectedOutput": "2.0", "isHidden": true}
]'::JSONB
WHERE slug = 'median-of-two-sorted-arrays';

-- Merge K Sorted Lists
UPDATE problems 
SET test_cases = '[
  {"input": "[[1,4,5],[1,3,4],[2,6]]", "expectedOutput": "[1,1,2,3,4,4,5,6]", "isHidden": false},
  {"input": "[]", "expectedOutput": "[]", "isHidden": false},
  {"input": "[[]]", "expectedOutput": "[]", "isHidden": false}
]'::JSONB
WHERE slug = 'merge-k-sorted-lists';

-- Trapping Rain Water
UPDATE problems 
SET test_cases = '[
  {"input": "[0,1,0,2,1,0,1,3,2,1,2,1]", "expectedOutput": "6", "isHidden": false},
  {"input": "[4,2,0,3,2,5]", "expectedOutput": "9", "isHidden": false},
  {"input": "[4,2,3]", "expectedOutput": "1", "isHidden": true}
]'::JSONB
WHERE slug = 'trapping-rain-water';

-- Regular Expression Matching
UPDATE problems 
SET test_cases = '[
  {"input": "aa\\na", "expectedOutput": "false", "isHidden": false},
  {"input": "aa\\na*", "expectedOutput": "true", "isHidden": false},
  {"input": "ab\\n.*", "expectedOutput": "true", "isHidden": false},
  {"input": "aab\\nc*a*b", "expectedOutput": "true", "isHidden": true}
]'::JSONB
WHERE slug = 'regular-expression-matching';

-- Wildcard Matching
UPDATE problems 
SET test_cases = '[
  {"input": "aa\\na", "expectedOutput": "false", "isHidden": false},
  {"input": "aa\\n*", "expectedOutput": "true", "isHidden": false},
  {"input": "cb\\n?a", "expectedOutput": "false", "isHidden": false},
  {"input": "adceb\\n*a*b", "expectedOutput": "true", "isHidden": true}
]'::JSONB
WHERE slug = 'wildcard-matching';

-- Longest Valid Parentheses
UPDATE problems 
SET test_cases = '[
  {"input": "(()", "expectedOutput": "2", "isHidden": false},
  {"input": ")()())", "expectedOutput": "4", "isHidden": false},
  {"input": "", "expectedOutput": "0", "isHidden": false},
  {"input": "()(())", "expectedOutput": "6", "isHidden": true}
]'::JSONB
WHERE slug = 'longest-valid-parentheses';

-- Edit Distance
UPDATE problems 
SET test_cases = '[
  {"input": "horse\\nros", "expectedOutput": "3", "isHidden": false},
  {"input": "intention\\nexecution", "expectedOutput": "5", "isHidden": false},
  {"input": "a\\nb", "expectedOutput": "1", "isHidden": true}
]'::JSONB
WHERE slug = 'edit-distance';

-- Word Ladder
UPDATE problems 
SET test_cases = '[
  {"input": "hit\\ncog\\n[\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]", "expectedOutput": "5", "isHidden": false},
  {"input": "hit\\ncog\\n[\"hot\",\"dot\",\"dog\",\"lot\",\"log\"]", "expectedOutput": "0", "isHidden": false}
]'::JSONB
WHERE slug = 'word-ladder';

-- Verification Query
SELECT slug, 
       COALESCE(jsonb_array_length(test_cases), 0) as test_case_count,
       difficulty
FROM problems
ORDER BY difficulty, slug;

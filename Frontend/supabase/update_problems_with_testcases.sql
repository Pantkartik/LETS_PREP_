-- Update Two Sum
UPDATE problems 
SET test_cases = '[
  { "input": [[2, 7, 11, 15], 9], "expectedOutput": [0, 1] },
  { "input": [[3, 2, 4], 6], "expectedOutput": [1, 2] },
  { "input": [[3, 3], 6], "expectedOutput": [0, 1] },
  { "input": [[0, 4, 3, 0], 0], "expectedOutput": [0, 3] },
  { "input": [[-3, 4, 3, 90], 0], "expectedOutput": [0, 2] }
]'::JSONB
WHERE slug = 'two-sum';

-- Update Reverse String
UPDATE problems 
SET test_cases = '[
  { "input": [["h","e","l","l","o"]], "expectedOutput": ["o","l","l","e","h"] },
  { "input": [["H","a","n","n","a","h"]], "expectedOutput": ["h","a","n","n","a","H"] },
  { "input": [["A"," ","b","a","n","a","n","a"]], "expectedOutput": ["a","n","a","n","a","b"," ","A"] }
]'::JSONB
WHERE slug = 'reverse-string';

-- Update Fibonacci Number
UPDATE problems 
SET test_cases = '[
  { "input": [2], "expectedOutput": 1 },
  { "input": [3], "expectedOutput": 2 },
  { "input": [4], "expectedOutput": 3 },
  { "input": [30], "expectedOutput": 832040 },
  { "input": [0], "expectedOutput": 0 }
]'::JSONB
WHERE slug = 'fibonacci-number';

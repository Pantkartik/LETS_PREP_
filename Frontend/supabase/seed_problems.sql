-- Seed Problems
INSERT INTO problems (title, slug, difficulty, category, description, time_limit_ms, memory_limit_mb, sample_input, sample_output, starter_code)
VALUES 
(
  'Two Sum', 
  'two-sum',
  'EASY', 
  'Arrays', 
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.', 
  1000, 
  128, 
  'nums = [2,7,11,15], target = 9', 
  '[0,1]', 
  '{"javascript": "function twoSum(nums, target) {\n    // Write your code here\n};"}'
),
(
  'Reverse String', 
  'reverse-string',
  'EASY', 
  'Strings', 
  'Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.', 
  1000, 
  128, 
  's = ["h","e","l","l","o"]', 
  '["o","l","l","e","h"]', 
  '{"javascript": "function reverseString(s) {\n    // Write your code here\n};"}'
),
(
  'Fibonacci Number', 
  'fibonacci-number',
  'EASY', 
  'DP', 
  'The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.', 
  1000, 
  128, 
  'n = 2', 
  '1', 
  '{"javascript": "function fib(n) {\n    // Write your code here\n};"}'
)
ON CONFLICT DO NOTHING;

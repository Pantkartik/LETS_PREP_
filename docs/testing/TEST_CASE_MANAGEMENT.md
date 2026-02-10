# Test Case Management Guide

## Problem: Ensuring Correct Code Verification

You're absolutely right - **code execution is only as good as the test cases**. If test cases are missing or incorrect, even perfect code will fail.

## Current State

### ✅ What's Working
1. **Execution Engine**: Secure Docker-based execution with proper isolation
2. **Template Engine**: Automatic C++ signature parsing and input generation
3. **Validation**: Exact match and floating-point comparison support

### ❌ What's Missing
- Many problems in the database lack comprehensive test cases
- Only 3 problems have test cases defined (Two Sum, Reverse String, Fibonacci)

## Solution: 3-Tier Approach

### Tier 1: Manual Test Case Definition (Immediate)

**File**: `Backend/scripts/generate_testcases.ts`

Add test cases for each problem manually:

```typescript
const problemTestCases: Record<string, TestCase[]> = {
    'find-k-closest-elements': [
        { 
            input: '[1,2,3,4,5]\n4\n3', 
            expectedOutput: '[1,2,3,4]', 
            isHidden: false 
        },
        // Add more test cases...
    ]
};
```

**Run**: `npx ts-node scripts/generate_testcases.ts`

### Tier 2: LeetCode API Scraping (Recommended)

**File**: `Backend/scripts/scrape_leetcode_testcases.ts`

Automatically fetch test cases from LeetCode's GraphQL API:

```bash
npm install axios
npx ts-node scripts/scrape_leetcode_testcases.ts
```

**Pros**:
- Automated
- Comprehensive coverage
- Official test cases

**Cons**:
- May require authentication
- Rate limiting
- Needs parsing logic per problem type

### Tier 3: Community Contributions

Create a web interface where users can:
1. Submit test cases for problems
2. Vote on test case quality
3. Report incorrect test cases

## Test Case Format

Our system expects:

```json
[
  {
    "input": "[1,2,3,4,5]\n4\n3",
    "expectedOutput": "[1,2,3,4]",
    "isHidden": false
  }
]
```

### Input Format Rules

1. **Vectors/Arrays**: Use JSON format `[1,2,3]`
2. **Multiple Arguments**: Separate with newlines `\n`
3. **Strings**: Use quotes if needed
4. **Complex Types**: Follow C++ iostream conventions

### Example: Find K Closest Elements

**Signature**: `vector<int> findClosestElements(vector<int>& arr, int k, int x)`

**Input**:
```
[1,2,3,4,5]
4
3
```

**Expected Output**:
```
[1,2,3,4]
```

## How to Add Test Cases for New Problems

### Method 1: Via SQL

```sql
UPDATE problems 
SET test_cases = '[
  { "input": "...", "expectedOutput": "...", "isHidden": false }
]'::JSONB
WHERE slug = 'problem-slug';
```

### Method 2: Via Script

Edit `scripts/generate_testcases.ts` and add:

```typescript
'your-problem-slug': [
    { input: '...', expectedOutput: '...', isHidden: false }
]
```

### Method 3: Via Admin Panel (Future)

Create an admin interface to:
- Upload test cases in bulk
- Test them against reference solutions
- Mark as hidden/visible

## Validation Strategy

### 1. Reference Solution
- Write a correct solution in C++/Python
- Run it against test inputs
- Capture outputs as expected results

### 2. Edge Cases
Always include:
- Empty input
- Single element
- Maximum constraints
- Negative numbers (if applicable)
- Duplicate values

### 3. Hidden Test Cases
- Mark 40-60% as hidden
- Include edge cases in hidden tests
- Prevent hardcoding solutions

## Next Steps

1. **Immediate**: Run `generate_testcases.ts` to populate existing problems
2. **Short-term**: Set up LeetCode scraper for automated updates
3. **Long-term**: Build admin panel for test case management

## Files Created

- `Backend/scripts/generate_testcases.ts` - Manual test case generator
- `Backend/scripts/scrape_leetcode_testcases.ts` - LeetCode API scraper
- `Backend/verify_engine.ts` - Test the execution engine

## Testing Your Changes

After adding test cases:

```bash
# Verify execution engine
cd Backend
npx ts-node verify_engine.ts

# Test specific problem
# Submit code via frontend and check results
```

## Current Fix Applied

✅ **C++ Template Engine** now correctly:
- Parses function signatures (e.g., `vector<int> findClosestElements(...)`)
- Generates input parsing code for vectors and primitives
- Strips references (`&`) and pointers (`*`) from variable declarations
- Calls the correct function name (not hardcoded `solve`)
- Formats vector outputs as `[1,2,3]`

**Result**: "Find K Closest Elements" and similar array problems now work correctly!

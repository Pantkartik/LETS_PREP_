# 🧪 Code Execution Testing Guide

## ✅ How to Test the Fixed Code Executor

### **Step 1: Navigate to a Problem**
Go to: `http://localhost:3000/problems`
Click on any problem (e.g., "Two Sum")

---

### **Step 2: Test with CORRECT Solution**

Copy and paste this **working** Two Sum solution:

```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}
```

**Click "Run"** → You should see:
- ✅ Status: **ACCEPTED**
- ✅ **3/3 test cases passed**
- ✅ Each test case shows: Input, Expected, Actual (all matching)
- ✅ Complexity Analysis displayed

**Click "Submit"** → You should see:
- 🎉 **Confetti animation**
- 🏆 **Celebration modal**
- ✅ **Problems solved count increases** in your profile

---

### **Step 3: Test with WRONG Solution**

Replace with this **incorrect** solution:

```javascript
function twoSum(nums, target) {
    return [0, 0]; // Always returns [0,0] - WRONG!
}
```

**Click "Run"** → You should see:
- ❌ Status: **WRONG_ANSWER**
- ❌ **1/3 test cases passed** (only first one might pass by luck)
- ❌ Failed test cases show:
  - Input: `[3,2,4], 6`
  - Expected: `[1,2]`
  - Actual: `[0,0]` ← **Mismatch!**

---

### **Step 4: Test Runtime Error**

Try this **broken** code:

```javascript
function twoSum(nums, target) {
    return nums.undefinedMethod(); // This will crash
}
```

**Click "Run"** → You should see:
- ⚠️ Status: **RUNTIME_ERROR**
- Error message explaining what went wrong

---

## 🎯 Supported Problems with Real Test Cases

The executor has proper test cases for:

1. **two-sum** - 3 test cases
2. **longest-substring-without-repeating-characters** - 3 test cases
3. **reverse-string** - 2 test cases
4. **valid-parentheses** - 3 test cases
5. **maximum-subarray** - 3 test cases
6. **contains-duplicate** - 3 test cases
7. **best-time-to-buy-and-sell-stock** - 2 test cases
8. **product-of-array-except-self** - 2 test cases

---

## 🔧 Language Support

### **Currently Supported:**
- ✅ **JavaScript** - Full execution and validation

### **Coming Soon (Requires Backend):**
- ⏳ Python
- ⏳ Java
- ⏳ C++

**Note:** When you select Python/Java/C++, you'll see a notification that these require the backend Docker service.

---

## 📊 What Gets Validated

For each test case, the executor checks:
1. **Input** - The test data passed to your function
2. **Expected Output** - What the correct answer should be
3. **Actual Output** - What your function returned
4. **Pass/Fail** - Deep equality comparison (JSON.stringify)

---

## 🎨 Visual Feedback

### **On Success:**
- Green checkmarks ✅
- "All test cases passed!" message
- Complexity analysis panel
- Confetti animation (on Submit)
- Stats update

### **On Failure:**
- Red X marks ❌
- Detailed error breakdown
- Shows which test case failed
- Expected vs Actual comparison

---

## 🐛 Troubleshooting

**Problem: "No function declaration found"**
- Make sure your code has `function functionName() { ... }`
- Arrow functions are not yet supported

**Problem: "Execution error"**
- Check for syntax errors in your code
- Make sure you're returning a value

**Problem: Test cases always fail**
- Verify your function name matches the problem
- Check that you're returning the correct data type
- Use `console.log()` won't work - return the answer directly

---

## 🚀 Next Steps

To add test cases for more problems:
1. Open `Frontend/lib/code-executor.ts`
2. Find the `getTestCases()` function
3. Add your problem slug and test cases:

```typescript
'your-problem-slug': [
    { 
        input: [/* your inputs as array */], 
        expectedOutput: /* expected result */ 
    },
    // ... more test cases
]
```

---

**Happy Coding! 🎉**

# Production-Grade Online Judge System
## Architecture Documentation

This document explains how to build a judging system like LeetCode/Codeforces that correctly evaluates code submissions.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Monaco Editor)                │
│  - Code editing                                              │
│  - Syntax highlighting                                       │
│  - Local testing (preview only, NOT for judging)            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP POST /api/submit
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Submission API Gateway                    │
│  - Validate request                                          │
│  - Rate limiting                                             │
│  - Authentication                                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Enqueue job
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Job Queue (Redis/RabbitMQ)                 │
│  - Async processing                                          │
│  - Load balancing                                            │
│  - Priority queues                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Worker picks job
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Docker Executor Service                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Container (Isolated)                                 │  │
│  │  - Compile code (if needed)                           │  │
│  │  - Run with test input (stdin)                        │  │
│  │  - Capture stdout/stderr                              │  │
│  │  - Track time/memory                                  │  │
│  │  - Enforce limits (CPU, Memory, Network=none)         │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Raw output
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Output Normalizer                         │
│  - Trim whitespace                                           │
│  - Normalize line endings (\r\n → \n)                       │
│  - Remove trailing spaces                                    │
│  - Handle empty lines                                        │
│  - Remove debug artifacts                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Normalized output
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      Custom Checker                          │
│  - Exact match                                               │
│  - Floating point (epsilon tolerance)                        │
│  - Unordered arrays                                          │
│  - Set comparison                                            │
│  - Multiple valid outputs                                    │
│  - Regex patterns                                            │
│  - JSON structure                                            │
│  - Graph/Tree comparison                                     │
│  - Custom validation logic                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Checker result
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      Verdict Engine                          │
│  - Aggregate test results                                    │
│  - Determine final verdict (AC/WA/TLE/MLE/RE/CE)            │
│  - Calculate score                                           │
│  - Track statistics                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Final result
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database & Response                       │
│  - Store submission                                          │
│  - Update leaderboard                                        │
│  - Return result to user                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## ❌ Common Mistakes That Cause False Wrong Answers

### 1. **Direct String Comparison**
```typescript
// ❌ WRONG - This fails 90% of the time
if (userOutput === expectedOutput) {
    return 'ACCEPTED';
}

// ✅ CORRECT - Normalize first
const normalize = (s: string) => s.trim().replace(/\r\n/g, '\n');
if (normalize(userOutput) === normalize(expectedOutput)) {
    return 'ACCEPTED';
}
```

### 2. **Ignoring Whitespace Differences**
```
User output:    "42 "      (trailing space)
Expected:       "42"
Direct match:   ❌ WRONG ANSWER
Normalized:     ✅ ACCEPTED
```

### 3. **Line Ending Mismatch (Windows vs Unix)**
```
Windows:  "hello\r\nworld"
Unix:     "hello\nworld"
Direct:   ❌ Different
Normalized: ✅ Same
```

### 4. **Not Handling Multiple Valid Outputs**
```typescript
// Problem: "Is the number even? Print YES or NO"
// Both "YES" and "yes" should be accepted

// ❌ WRONG
if (output === "YES") { ... }

// ✅ CORRECT
const validOutputs = ["YES", "yes", "Yes"];
if (validOutputs.includes(output.trim())) { ... }
```

### 5. **Floating Point Precision**
```typescript
// User: 3.14159265
// Expected: 3.14159266
// Difference: 0.00000001

// ❌ WRONG - Direct comparison fails
if (userAnswer === expectedAnswer) { ... }

// ✅ CORRECT - Use epsilon tolerance
const epsilon = 1e-6;
if (Math.abs(userAnswer - expectedAnswer) <= epsilon) { ... }
```

### 6. **Extra Debug Output**
```cpp
// User's code:
cout << "Enter number: ";  // ❌ This breaks output
int n;
cin >> n;
cout << n * 2;
```
Output: `"Enter number: 10"` instead of `"10"`

**Solution**: Reject submissions with prompts, or strip them in normalizer.

### 7. **Order-Dependent Comparison**
```
Problem: "Print all prime numbers from 1 to 10"
User:    "2 3 5 7"
Expected: "7 5 3 2"  (different order)

If order doesn't matter, use unordered checker!
```

### 8. **Language-Specific I/O Differences**
```python
# Python adds newline by default
print(42)  # Output: "42\n"

# C++ doesn't
cout << 42;  // Output: "42"

# Both should be accepted as "42"
```

---

## ✅ Best Practices

### 1. **Output Normalization Pipeline**
```typescript
function normalize(output: string): string {
    return output
        .replace(/\r\n/g, '\n')      // Windows → Unix
        .split('\n')                  // Split lines
        .map(line => line.trim())     // Trim each line
        .filter(line => line.length > 0)  // Remove empty
        .join('\n');                  // Rejoin
}
```

### 2. **Docker Execution Best Practices**
```bash
docker run \
    --memory=512m \              # Memory limit
    --cpus=1 \                   # CPU limit
    --pids-limit=64 \            # Process limit
    --network=none \             # No internet
    --read-only \                # Read-only filesystem
    --tmpfs /tmp:size=100m \     # Temp storage
    --user=nobody \              # Non-root user
    --cap-drop=ALL \             # Drop all capabilities
    --security-opt=no-new-privileges \
    judge-image:latest
```

### 3. **Language-Specific Compilation Flags**

**C++:**
```bash
g++ -std=gnu++17 -O2 -Wall -Wextra -Wshadow \
    -Wno-unused-result -Wno-sign-compare \
    solution.cpp -o solution
```

**Java:**
```bash
javac -encoding UTF-8 -J-Xms256m -J-Xmx512m Solution.java
java -Xms256m -Xmx512m -Xss64m Solution
```

**Python:**
```bash
python3 -u solution.py  # -u for unbuffered output
```

### 4. **Test Case Structure**
```typescript
interface TestCase {
    id: number;
    input: string;           // stdin
    expectedOutput: string;  // expected stdout
    isHidden: boolean;       // hide from user
    timeLimit: number;       // ms
    memoryLimit: number;     // MB
    points: number;          // for scoring
}
```

### 5. **Hidden Test Cases**
```typescript
// Sample test (visible to user)
{
    id: 1,
    input: "5",
    expectedOutput: "120",
    isHidden: false
}

// Hidden test (not visible)
{
    id: 2,
    input: "1000",
    expectedOutput: "...",
    isHidden: true  // User only sees "Test 2: Wrong Answer"
}
```

### 6. **Verdict Priority**
When multiple errors occur, return the highest priority:
```
1. COMPILATION_ERROR  (can't even run)
2. SYSTEM_ERROR       (judge failure)
3. RUNTIME_ERROR      (crashed)
4. TIME_LIMIT_EXCEEDED
5. MEMORY_LIMIT_EXCEEDED
6. WRONG_ANSWER
7. ACCEPTED
```

### 7. **Time Measurement**
```typescript
// ❌ WRONG - Includes compilation time
const start = Date.now();
compile();
run();
const time = Date.now() - start;

// ✅ CORRECT - Only execution time
compile();
const start = Date.now();
run();
const time = Date.now() - start;
```

### 8. **Memory Measurement**
```bash
# Use Docker stats or /usr/bin/time
/usr/bin/time -v ./solution 2>&1 | grep "Maximum resident set size"
```

---

## 🧪 Example Problem Configurations

### Problem 1: Simple Addition (Exact Match)
```typescript
{
    checkerType: 'exact',
    testCases: [
        { input: "2 3", expectedOutput: "5" },
        { input: "100 200", expectedOutput: "300" }
    ]
}
```

### Problem 2: Floating Point (Epsilon Tolerance)
```typescript
{
    checkerType: 'float',
    checkerOptions: { epsilon: 1e-6 },
    testCases: [
        { input: "3.14159", expectedOutput: "9.8696" }
    ]
}
```

### Problem 3: Unordered Array (Order Doesn't Matter)
```typescript
{
    checkerType: 'unordered',
    testCases: [
        { input: "5", expectedOutput: "2 3 5 7 11" }
        // User output "11 7 5 3 2" is also correct
    ]
}
```

### Problem 4: Multiple Valid Outputs
```typescript
{
    checkerType: 'multiple',
    checkerOptions: {
        validOutputs: ["YES", "NO"]
    }
}
```

### Problem 5: Custom Checker (Palindrome)
```typescript
{
    checkerType: 'custom',
    customChecker: (userOutput, expectedOutput, input) => {
        const cleaned = userOutput.trim().toLowerCase();
        const reversed = cleaned.split('').reverse().join('');
        const isPalindrome = cleaned === reversed;
        
        return {
            passed: isPalindrome,
            message: isPalindrome ? 'Valid palindrome' : 'Not a palindrome'
        };
    }
}
```

---

## 🔒 Security Considerations

### 1. **Prevent Infinite Loops**
```typescript
// Set strict time limits
const timeLimit = 2000; // 2 seconds max

// Kill process if exceeded
setTimeout(() => {
    process.kill(childPid, 'SIGKILL');
}, timeLimit);
```

### 2. **Prevent Fork Bombs**
```bash
# Limit number of processes
--pids-limit=64
```

### 3. **Prevent File System Access**
```bash
# Read-only filesystem
--read-only

# Only /tmp is writable (limited size)
--tmpfs /tmp:size=100m
```

### 4. **Prevent Network Access**
```bash
--network=none
```

### 5. **Prevent Privilege Escalation**
```bash
--user=nobody
--cap-drop=ALL
--security-opt=no-new-privileges
```

---

## 📊 Performance Optimization

### 1. **Container Pooling**
Pre-create warm containers instead of cold starts:
```typescript
const containerPool = new ContainerPool({
    minSize: 10,
    maxSize: 100,
    languages: ['cpp', 'python', 'java']
});
```

### 2. **Parallel Test Execution**
Run independent tests in parallel:
```typescript
const results = await Promise.all(
    testCases.map(test => executeTest(test))
);
```

### 3. **Caching Compiled Code**
Cache compilation results for repeated submissions:
```typescript
const cacheKey = `${problemId}:${codeHash}`;
const compiled = await cache.get(cacheKey);
```

### 4. **Early Termination**
Stop on first failure for faster feedback:
```typescript
for (const test of testCases) {
    const result = await execute(test);
    if (!result.passed) {
        return { verdict: 'WRONG_ANSWER', failedAt: test.id };
    }
}
```

---

## 🎯 Integration Example

```typescript
import { JudgeEngine, TestCase, ProblemConfig } from './judge';

// Define problem
const testCases: TestCase[] = [
    JudgeEngine.createTestCase(1, "5", "120", false, 1000, 256),
    JudgeEngine.createTestCase(2, "10", "3628800", true, 1000, 256)
];

const config: ProblemConfig = {
    checkerType: 'exact'
};

// Execute code (your existing Docker execution)
const executionResults = await executeInDocker(code, testCases);

// Judge results
const judgeResult = JudgeEngine.judge(testCases, executionResults, config);

console.log(judgeResult);
// {
//     verdict: 'ACCEPTED',
//     passedCount: 2,
//     totalCount: 2,
//     score: 100,
//     executionTime: 45,
//     memoryUsed: 12
// }
```

---

## 📚 Further Reading

- [Codeforces Polygon System](https://polygon.codeforces.com/)
- [LeetCode System Design](https://leetcode.com/discuss/general-discussion/1082786)
- [DMOJ Judge Documentation](https://docs.dmoj.ca/)
- [Isolate Sandbox](https://github.com/ioi/isolate)

---

## 🚀 Quick Start Checklist

- [ ] Use output normalization (trim, line endings)
- [ ] Choose appropriate checker type
- [ ] Set time/memory limits
- [ ] Use Docker isolation
- [ ] Implement hidden test cases
- [ ] Handle all verdict types
- [ ] Sanitize error messages
- [ ] Test with edge cases
- [ ] Monitor performance
- [ ] Log all submissions

---

**Remember**: 99% of "wrong answer" bugs are due to improper output comparison, not actual logic errors!

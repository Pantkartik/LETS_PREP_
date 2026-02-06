# Production-Grade Judge System - Quick Reference

## 🎯 The Problem You Had

```typescript
// ❌ YOUR OLD CODE (99% of judges fail here)
if (userOutput === expectedOutput) {
    return 'ACCEPTED';
}
```

**Why it fails:**
- `"42\n"` ≠ `"42"` (trailing newline)
- `"42 "` ≠ `"42"` (trailing space)
- `"hello\r\nworld"` ≠ `"hello\nworld"` (Windows vs Unix)
- `"3.14159"` ≠ `"3.14160"` (floating point)
- `"1 2 3"` ≠ `"3 2 1"` (order doesn't matter for some problems)

## ✅ The Solution

```typescript
// ✅ PRODUCTION-GRADE (LeetCode/Codeforces style)
import { JudgeEngine } from './services/judge/judgeEngine';

const result = JudgeEngine.judge(testCases, executionResults, config);
```

---

## 📊 Architecture Flow

```
┌──────────────────────────────────────────────────────────────┐
│  STEP 1: User Submits Code                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  function factorial(n) {                               │  │
│  │      if (n <= 1) return 1;                             │  │
│  │      return n * factorial(n - 1);                      │  │
│  │  }                                                      │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 2: Docker Execution (Isolated Container)               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  docker run --memory=512m --cpus=1 --network=none     │  │
│  │  Input (stdin):  "5"                                   │  │
│  │  Output (stdout): "120\n"                              │  │
│  │  Time: 45ms, Memory: 12MB                              │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 3: Output Normalization                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Raw:        "120\n"                                   │  │
│  │  Normalized: "120"                                     │  │
│  │                                                         │  │
│  │  - Trim whitespace                                     │  │
│  │  - Convert \r\n → \n                                   │  │
│  │  - Remove empty lines                                  │  │
│  │  - Trim each line                                      │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 4: Custom Checker                                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Checker Type: exact / float / unordered / custom     │  │
│  │                                                         │  │
│  │  User:     "120"                                       │  │
│  │  Expected: "120"                                       │  │
│  │  Result:   ✅ MATCH                                    │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 5: Verdict Determination                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  ✅ All tests passed                                   │  │
│  │  ✅ Time: 45ms < 1000ms limit                          │  │
│  │  ✅ Memory: 12MB < 256MB limit                         │  │
│  │  ✅ Exit code: 0 (no errors)                           │  │
│  │                                                         │  │
│  │  VERDICT: ACCEPTED                                     │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔧 Quick Integration

### 1. Basic Setup
```typescript
import { JudgeEngine, TestCase, ProblemConfig } from './services/judge/judgeEngine';

// Define test cases
const testCases: TestCase[] = [
    {
        id: 1,
        input: "5",
        expectedOutput: "120",
        isHidden: false,
        timeLimit: 1000,
        memoryLimit: 256
    }
];

// Configure checker
const config: ProblemConfig = {
    checkerType: 'exact'  // or 'float', 'unordered', 'custom'
};
```

### 2. Execute Code (Your Existing Docker Logic)
```typescript
const executionResults = await executeInDocker(code, testCases);
// Returns: [{ output, executionTime, memoryUsed, exitCode, stderr }]
```

### 3. Judge Results
```typescript
const result = JudgeEngine.judge(testCases, executionResults, config);

console.log(result.verdict);        // 'ACCEPTED' | 'WRONG_ANSWER' | 'TLE' | ...
console.log(result.passedCount);    // 1
console.log(result.totalCount);     // 1
console.log(result.score);          // 100
```

---

## 🎨 Checker Types

| Type | Use Case | Example |
|------|----------|---------|
| `exact` | Exact string match | "hello" = "hello" |
| `float` | Decimal numbers | 3.14159 ≈ 3.14160 (ε=1e-6) |
| `token` | Whitespace flexible | "1 2 3" = "1  2  3" |
| `unordered` | Order doesn't matter | "3 1 2" = "1 2 3" |
| `set` | Duplicates ignored | "1 2 2 3" = "1 2 3" |
| `range` | Value in range | 50 ∈ [1, 100] |
| `multiple` | Any valid answer | "YES" or "yes" or "1" |
| `regex` | Pattern match | /^\d{3}-\d{4}$/ |
| `json` | JSON structure | {"a":1} = {"a":1} |
| `custom` | Your logic | (user, expected, input) => {...} |

---

## 📝 Common Patterns

### Pattern 1: Simple Math Problem
```typescript
{
    checkerType: 'exact',
    testCases: [
        { input: "2 3", expectedOutput: "5" }
    ]
}
```

### Pattern 2: Floating Point
```typescript
{
    checkerType: 'float',
    checkerOptions: { epsilon: 1e-6 },
    testCases: [
        { input: "3.14159", expectedOutput: "9.8696" }
    ]
}
```

### Pattern 3: Find All Primes (Order Doesn't Matter)
```typescript
{
    checkerType: 'unordered',
    testCases: [
        { input: "10", expectedOutput: "2 3 5 7" }
    ]
}
```

### Pattern 4: Yes/No Question
```typescript
{
    checkerType: 'multiple',
    checkerOptions: {
        validOutputs: ["YES", "yes", "Yes", "1", "true"]
    }
}
```

### Pattern 5: Custom Validation
```typescript
{
    checkerType: 'custom',
    customChecker: (userOutput, expectedOutput, input) => {
        const num = parseInt(userOutput);
        const isEven = num % 2 === 0;
        return {
            passed: isEven,
            message: isEven ? 'Correct' : 'Number is odd'
        };
    }
}
```

---

## 🚨 Verdict Types

```
Priority (highest to lowest):

1. COMPILATION_ERROR  ← Can't even compile
2. SYSTEM_ERROR       ← Judge crashed
3. RUNTIME_ERROR      ← Code crashed
4. TIME_LIMIT_EXCEEDED ← Too slow
5. MEMORY_LIMIT_EXCEEDED ← Too much RAM
6. WRONG_ANSWER       ← Output mismatch
7. ACCEPTED           ← All good! ✅
```

---

## 🔒 Security Checklist

- [x] Docker isolation (`--network=none`)
- [x] Memory limits (`--memory=512m`)
- [x] CPU limits (`--cpus=1`)
- [x] Process limits (`--pids-limit=64`)
- [x] Time limits (enforced)
- [x] Read-only filesystem
- [x] Non-root user
- [x] Error sanitization

---

## 📈 Performance Tips

1. **Parallel Execution**: Run independent tests in parallel
2. **Early Termination**: Stop on first failure
3. **Container Pooling**: Pre-warm containers
4. **Compilation Caching**: Cache compiled binaries

---

## 🐛 Debugging

### Issue: All submissions get WA
**Fix**: Check normalization
```typescript
console.log('User:', JSON.stringify(userOutput));
console.log('Expected:', JSON.stringify(expectedOutput));
```

### Issue: Floating point always fails
**Fix**: Use float checker with epsilon
```typescript
{ checkerType: 'float', checkerOptions: { epsilon: 1e-6 } }
```

### Issue: Order matters when it shouldn't
**Fix**: Use unordered checker
```typescript
{ checkerType: 'unordered' }
```

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `judge/outputNormalizer.ts` | Output cleaning |
| `judge/customChecker.ts` | Comparison logic |
| `judge/judgeEngine.ts` | Main orchestrator |
| `judge/examples.ts` | Usage examples |
| `JUDGE_SYSTEM_ARCHITECTURE.md` | Full docs |
| `JUDGE_IMPLEMENTATION_SUMMARY.md` | This guide |

---

## ✅ Testing

Run examples:
```bash
cd Backend
npx ts-node src/services/judge/examples.ts
```

Run tests:
```bash
npm test -- judge.test.ts
```

---

## 🎉 Result

**Before**: 🔴 Correct code marked wrong

**After**: ✅ Production-grade judging like LeetCode

---

**Questions?** See `JUDGE_SYSTEM_ARCHITECTURE.md` for deep dive.

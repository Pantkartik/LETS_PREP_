/**
 * Example Usage of Production-Grade Judge System
 * 
 * This file demonstrates how to use the judge system for different problem types.
 */

import { JudgeEngine, TestCase, ProblemConfig } from './judge/judgeEngine';
import { CustomChecker } from './judge/customChecker';

// ============================================================================
// EXAMPLE 1: Simple Problem (Two Sum)
// ============================================================================

export function example1_TwoSum() {
    const testCases: TestCase[] = [
        JudgeEngine.createTestCase(
            1,
            "2 7 11 15\n9",  // input: array and target
            "0 1",            // expected: indices
            false,            // not hidden
            1000,             // 1 second limit
            256               // 256 MB limit
        ),
        JudgeEngine.createTestCase(
            2,
            "3 2 4\n6",
            "1 2",
            true,             // hidden test
            1000,
            256
        )
    ];

    const config: ProblemConfig = {
        checkerType: 'exact'  // Exact match after normalization
    };

    // Simulate execution results (from Docker)
    const executionResults = [
        { output: "0 1\n", executionTime: 45, memoryUsed: 12, exitCode: 0, stderr: "" },
        { output: "1 2", executionTime: 50, memoryUsed: 14, exitCode: 0, stderr: "" }
    ];

    const result = JudgeEngine.judge(testCases, executionResults, config);

    console.log('Example 1 - Two Sum:');
    console.log(`Verdict: ${result.verdict}`);
    console.log(`Passed: ${result.passedCount}/${result.totalCount}`);
    console.log(`Score: ${result.score}%`);
}

// ============================================================================
// EXAMPLE 2: Floating Point Problem (Calculate Pi)
// ============================================================================

export function example2_CalculatePi() {
    const testCases: TestCase[] = [
        JudgeEngine.createTestCase(
            1,
            "1000",           // iterations
            "3.14159265",     // expected pi approximation
            false,
            2000,
            256
        )
    ];

    const config: ProblemConfig = {
        checkerType: 'float',
        checkerOptions: {
            epsilon: 1e-6    // Allow 0.000001 difference
        }
    };

    const executionResults = [
        { output: "3.14159264", executionTime: 120, memoryUsed: 8, exitCode: 0, stderr: "" }
    ];

    const result = JudgeEngine.judge(testCases, executionResults, config);

    console.log('\nExample 2 - Calculate Pi:');
    console.log(`Verdict: ${result.verdict}`);
    console.log(`Message: ${result.testCaseResults[0].checkerMessage}`);
}

// ============================================================================
// EXAMPLE 3: Unordered Output (Find Primes)
// ============================================================================

export function example3_FindPrimes() {
    const testCases: TestCase[] = [
        JudgeEngine.createTestCase(
            1,
            "10",
            "2 3 5 7",        // Order doesn't matter
            false,
            1000,
            256
        )
    ];

    const config: ProblemConfig = {
        checkerType: 'unordered'  // User can output "7 5 3 2" and it's still correct
    };

    const executionResults = [
        { output: "7 5 3 2", executionTime: 80, memoryUsed: 10, exitCode: 0, stderr: "" }
    ];

    const result = JudgeEngine.judge(testCases, executionResults, config);

    console.log('\nExample 3 - Find Primes:');
    console.log(`Verdict: ${result.verdict}`);
}

// ============================================================================
// EXAMPLE 4: Multiple Valid Outputs (Yes/No Problem)
// ============================================================================

export function example4_IsEven() {
    const testCases: TestCase[] = [
        JudgeEngine.createTestCase(
            1,
            "4",
            "YES",            // Both "YES" and "yes" are valid
            false,
            1000,
            256
        )
    ];

    const config: ProblemConfig = {
        checkerType: 'multiple',
        checkerOptions: {
            validOutputs: ["YES", "yes", "Yes", "1", "true"]
        }
    };

    const executionResults = [
        { output: "yes", executionTime: 30, memoryUsed: 5, exitCode: 0, stderr: "" }
    ];

    const result = JudgeEngine.judge(testCases, executionResults, config);

    console.log('\nExample 4 - Is Even:');
    console.log(`Verdict: ${result.verdict}`);
}

// ============================================================================
// EXAMPLE 5: Custom Checker (Palindrome Validator)
// ============================================================================

export function example5_Palindrome() {
    const testCases: TestCase[] = [
        JudgeEngine.createTestCase(
            1,
            "racecar",
            "true",           // Expected doesn't matter for custom checker
            false,
            1000,
            256
        )
    ];

    const config: ProblemConfig = {
        checkerType: 'custom',
        customChecker: (userOutput, expectedOutput, input) => {
            const word = input.trim().toLowerCase();
            const reversed = word.split('').reverse().join('');
            const isPalindrome = word === reversed;

            const userSaysYes = userOutput.trim().toLowerCase() === 'true';

            return {
                passed: userSaysYes === isPalindrome,
                message: isPalindrome
                    ? 'Correctly identified palindrome'
                    : 'Correctly identified non-palindrome'
            };
        }
    };

    const executionResults = [
        { output: "true", executionTime: 25, memoryUsed: 4, exitCode: 0, stderr: "" }
    ];

    const result = JudgeEngine.judge(testCases, executionResults, config);

    console.log('\nExample 5 - Palindrome:');
    console.log(`Verdict: ${result.verdict}`);
    console.log(`Message: ${result.testCaseResults[0].checkerMessage}`);
}

// ============================================================================
// EXAMPLE 6: Graph Problem (Custom Checker)
// ============================================================================

export function example6_ShortestPath() {
    const testCases: TestCase[] = [
        JudgeEngine.createTestCase(
            1,
            "5 6\n1 2\n1 3\n2 4\n3 4\n4 5\n3 5",  // Graph edges
            "1 2 4 5",        // One valid path
            false,
            2000,
            256
        )
    ];

    const config: ProblemConfig = {
        checkerType: 'custom',
        customChecker: (userOutput, expectedOutput, input) => {
            // Parse user's path
            const userPath = userOutput.trim().split(/\s+/).map(Number);

            // Validate path length (should be shortest)
            const expectedLength = 4;
            if (userPath.length !== expectedLength) {
                return {
                    passed: false,
                    message: `Path length ${userPath.length} != ${expectedLength}`
                };
            }

            // Validate path starts at 1 and ends at 5
            if (userPath[0] !== 1 || userPath[userPath.length - 1] !== 5) {
                return {
                    passed: false,
                    message: 'Path must start at 1 and end at 5'
                };
            }

            // In real implementation, validate edges exist
            return {
                passed: true,
                message: 'Valid shortest path'
            };
        }
    };

    const executionResults = [
        { output: "1 3 5", executionTime: 150, memoryUsed: 20, exitCode: 0, stderr: "" }
    ];

    const result = JudgeEngine.judge(testCases, executionResults, config);

    console.log('\nExample 6 - Shortest Path:');
    console.log(`Verdict: ${result.verdict}`);
    console.log(`Message: ${result.testCaseResults[0].checkerMessage}`);
}

// ============================================================================
// EXAMPLE 7: Time Limit Exceeded
// ============================================================================

export function example7_TLE() {
    const testCases: TestCase[] = [
        JudgeEngine.createTestCase(
            1,
            "1000000",
            "500000500000",
            false,
            1000,             // 1 second limit
            256
        )
    ];

    const config: ProblemConfig = {
        checkerType: 'exact'
    };

    const executionResults = [
        {
            output: "500000500000",
            executionTime: 1500,  // Exceeded 1000ms limit!
            memoryUsed: 10,
            exitCode: 0,
            stderr: ""
        }
    ];

    const result = JudgeEngine.judge(testCases, executionResults, config);

    console.log('\nExample 7 - TLE:');
    console.log(`Verdict: ${result.verdict}`);  // TIME_LIMIT_EXCEEDED
    console.log(`Error: ${result.testCaseResults[0].error}`);
}

// ============================================================================
// EXAMPLE 8: Runtime Error
// ============================================================================

export function example8_RuntimeError() {
    const testCases: TestCase[] = [
        JudgeEngine.createTestCase(
            1,
            "10 0",           // Division by zero
            "error",
            false,
            1000,
            256
        )
    ];

    const config: ProblemConfig = {
        checkerType: 'exact'
    };

    const executionResults = [
        {
            output: "",
            executionTime: 50,
            memoryUsed: 5,
            exitCode: 1,      // Non-zero exit code
            stderr: "ZeroDivisionError: division by zero\n  File \"solution.py\", line 3"
        }
    ];

    const result = JudgeEngine.judge(testCases, executionResults, config);

    console.log('\nExample 8 - Runtime Error:');
    console.log(`Verdict: ${result.verdict}`);  // RUNTIME_ERROR
    console.log(`Error: ${result.testCaseResults[0].error}`);
}

// ============================================================================
// EXAMPLE 9: Hidden Test Cases
// ============================================================================

export function example9_HiddenTests() {
    const testCases: TestCase[] = [
        JudgeEngine.createTestCase(1, "5", "120", false, 1000, 256),    // Sample (visible)
        JudgeEngine.createTestCase(2, "10", "3628800", true, 1000, 256), // Hidden
        JudgeEngine.createTestCase(3, "20", "2432902008176640000", true, 1000, 256) // Hidden
    ];

    const config: ProblemConfig = {
        checkerType: 'exact',
        showHiddenOutputs: false  // Don't reveal hidden test outputs
    };

    const executionResults = [
        { output: "120", executionTime: 30, memoryUsed: 5, exitCode: 0, stderr: "" },
        { output: "3628800", executionTime: 35, memoryUsed: 6, exitCode: 0, stderr: "" },
        { output: "wrong", executionTime: 40, memoryUsed: 7, exitCode: 0, stderr: "" }
    ];

    const result = JudgeEngine.judge(testCases, executionResults, config);

    console.log('\nExample 9 - Hidden Tests:');
    console.log(`Verdict: ${result.verdict}`);
    console.log(`Passed: ${result.passedCount}/${result.totalCount}`);
    console.log(`First Failed: Test #${result.firstFailedTest}`);

    // Hidden test outputs are not shown
    result.testCaseResults.forEach((r, i) => {
        console.log(`Test ${i + 1}: ${r.verdict} ${r.actualOutput ? `(output: ${r.actualOutput})` : '(hidden)'}`);
    });
}

// ============================================================================
// Run all examples
// ============================================================================

if (require.main === module) {
    console.log('='.repeat(70));
    console.log('PRODUCTION-GRADE JUDGE SYSTEM EXAMPLES');
    console.log('='.repeat(70));

    example1_TwoSum();
    example2_CalculatePi();
    example3_FindPrimes();
    example4_IsEven();
    example5_Palindrome();
    example6_ShortestPath();
    example7_TLE();
    example8_RuntimeError();
    example9_HiddenTests();

    console.log('\n' + '='.repeat(70));
    console.log('All examples completed!');
    console.log('='.repeat(70));
}

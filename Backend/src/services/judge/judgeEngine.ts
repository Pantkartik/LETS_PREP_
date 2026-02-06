/**
 * Production-Grade Judge Engine
 * Architecture based on LeetCode/Codeforces
 * 
 * Features:
 * - Multiple test case execution
 * - Custom checkers per problem
 * - Verdict system (AC, WA, TLE, MLE, RE, CE)
 * - Hidden test cases
 * - Partial scoring
 * - Time/Memory tracking
 */

import { OutputNormalizer } from './outputNormalizer';
import { CustomChecker, CheckerResult, CheckerFunction } from './customChecker';

export type Verdict =
    | 'ACCEPTED'              // AC - All test cases passed
    | 'WRONG_ANSWER'          // WA - Output doesn't match
    | 'TIME_LIMIT_EXCEEDED'   // TLE - Execution too slow
    | 'MEMORY_LIMIT_EXCEEDED' // MLE - Used too much memory
    | 'RUNTIME_ERROR'         // RE - Crashed during execution
    | 'COMPILATION_ERROR'     // CE - Failed to compile
    | 'PRESENTATION_ERROR'    // PE - Format issue (rare)
    | 'SYSTEM_ERROR';         // SE - Judge system error

export type CheckerType =
    | 'exact'           // Exact string match (normalized)
    | 'token'           // Token-based match
    | 'float'           // Floating point with epsilon
    | 'unordered'       // Order doesn't matter
    | 'set'             // Set comparison
    | 'range'           // Value within range
    | 'multiple'        // Multiple valid outputs
    | 'regex'           // Regex pattern
    | 'json'            // JSON comparison
    | 'graph'           // Graph structure
    | 'custom';         // Custom function

export interface TestCase {
    id: number;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
    timeLimit: number;      // milliseconds
    memoryLimit: number;    // MB
    points?: number;        // For partial scoring
}

export interface TestCaseResult {
    testCaseId: number;
    verdict: Verdict;
    passed: boolean;
    actualOutput?: string;
    expectedOutput?: string;  // Hide for hidden test cases
    executionTime: number;
    memoryUsed: number;
    checkerMessage?: string;
    points?: number;
    error?: string;
}

export interface JudgeResult {
    verdict: Verdict;
    testCaseResults: TestCaseResult[];
    passedCount: number;
    totalCount: number;
    score: number;           // 0-100
    executionTime: number;   // Max time across all tests
    memoryUsed: number;      // Max memory across all tests
    errorMessage?: string;
    firstFailedTest?: number;
}

export interface ProblemConfig {
    checkerType: CheckerType;
    checkerOptions?: {
        epsilon?: number;           // For float checker
        validOutputs?: string[];    // For multiple checker
        pattern?: RegExp;           // For regex checker
        min?: number;               // For range checker
        max?: number;               // For range checker
    };
    customChecker?: CheckerFunction;
    showHiddenOutputs?: boolean;    // For debugging
    partialCredit?: boolean;        // Allow partial scores
}

export class JudgeEngine {
    /**
     * Main judging function
     */
    public static judge(
        testCases: TestCase[],
        executionResults: Array<{
            output: string;
            executionTime: number;
            memoryUsed: number;
            exitCode: number;
            stderr: string;
        }>,
        problemConfig: ProblemConfig
    ): JudgeResult {
        const testCaseResults: TestCaseResult[] = [];
        let passedCount = 0;
        let totalPoints = 0;
        let earnedPoints = 0;
        let maxTime = 0;
        let maxMemory = 0;
        let firstFailedTest: number | undefined;

        // Process each test case
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const execution = executionResults[i];

            // Update max time/memory
            maxTime = Math.max(maxTime, execution.executionTime);
            maxMemory = Math.max(maxMemory, execution.memoryUsed);

            // Check for runtime errors
            if (execution.exitCode !== 0) {
                const result: TestCaseResult = {
                    testCaseId: testCase.id,
                    verdict: 'RUNTIME_ERROR',
                    passed: false,
                    executionTime: execution.executionTime,
                    memoryUsed: execution.memoryUsed,
                    error: this.sanitizeError(execution.stderr),
                    expectedOutput: testCase.isHidden ? undefined : testCase.expectedOutput
                };
                testCaseResults.push(result);
                if (firstFailedTest === undefined) firstFailedTest = i + 1;
                continue;
            }

            // Check time limit
            if (execution.executionTime > testCase.timeLimit) {
                const result: TestCaseResult = {
                    testCaseId: testCase.id,
                    verdict: 'TIME_LIMIT_EXCEEDED',
                    passed: false,
                    executionTime: execution.executionTime,
                    memoryUsed: execution.memoryUsed,
                    error: `Time limit exceeded: ${execution.executionTime}ms > ${testCase.timeLimit}ms`,
                    expectedOutput: testCase.isHidden ? undefined : testCase.expectedOutput
                };
                testCaseResults.push(result);
                if (firstFailedTest === undefined) firstFailedTest = i + 1;
                continue;
            }

            // Check memory limit
            if (execution.memoryUsed > testCase.memoryLimit) {
                const result: TestCaseResult = {
                    testCaseId: testCase.id,
                    verdict: 'MEMORY_LIMIT_EXCEEDED',
                    passed: false,
                    executionTime: execution.executionTime,
                    memoryUsed: execution.memoryUsed,
                    error: `Memory limit exceeded: ${execution.memoryUsed}MB > ${testCase.memoryLimit}MB`,
                    expectedOutput: testCase.isHidden ? undefined : testCase.expectedOutput
                };
                testCaseResults.push(result);
                if (firstFailedTest === undefined) firstFailedTest = i + 1;
                continue;
            }

            // Run checker
            const checkerResult = this.runChecker(
                execution.output,
                testCase.expectedOutput,
                testCase.input,
                problemConfig
            );

            // Calculate points
            const testPoints = testCase.points || 1;
            totalPoints += testPoints;
            if (checkerResult.passed) {
                earnedPoints += testPoints * (checkerResult.score || 1);
                passedCount++;
            }

            const result: TestCaseResult = {
                testCaseId: testCase.id,
                verdict: checkerResult.passed ? 'ACCEPTED' : 'WRONG_ANSWER',
                passed: checkerResult.passed,
                actualOutput: testCase.isHidden && !problemConfig.showHiddenOutputs
                    ? undefined
                    : execution.output,
                expectedOutput: testCase.isHidden && !problemConfig.showHiddenOutputs
                    ? undefined
                    : testCase.expectedOutput,
                executionTime: execution.executionTime,
                memoryUsed: execution.memoryUsed,
                checkerMessage: checkerResult.message,
                points: testPoints * (checkerResult.score || (checkerResult.passed ? 1 : 0))
            };

            testCaseResults.push(result);

            if (!checkerResult.passed && firstFailedTest === undefined) {
                firstFailedTest = i + 1;
            }
        }

        // Determine overall verdict
        const verdict = this.determineVerdict(testCaseResults);

        // Calculate score (0-100)
        const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

        return {
            verdict,
            testCaseResults,
            passedCount,
            totalCount: testCases.length,
            score,
            executionTime: maxTime,
            memoryUsed: maxMemory,
            firstFailedTest
        };
    }

    /**
     * Run appropriate checker based on problem config
     */
    private static runChecker(
        userOutput: string,
        expectedOutput: string,
        input: string,
        config: ProblemConfig
    ): CheckerResult {
        // Use custom checker if provided
        if (config.customChecker) {
            return config.customChecker(userOutput, expectedOutput, input);
        }

        // Use built-in checkers
        switch (config.checkerType) {
            case 'exact':
                return CustomChecker.exactMatch(userOutput, expectedOutput);

            case 'token':
                return CustomChecker.tokenMatch(userOutput, expectedOutput);

            case 'float':
                return CustomChecker.floatingPoint(
                    userOutput,
                    expectedOutput,
                    config.checkerOptions?.epsilon
                );

            case 'unordered':
                return CustomChecker.unorderedMatch(userOutput, expectedOutput);

            case 'set':
                return CustomChecker.setMatch(userOutput, expectedOutput);

            case 'range':
                if (config.checkerOptions?.min === undefined || config.checkerOptions?.max === undefined) {
                    throw new Error('Range checker requires min and max options');
                }
                return CustomChecker.rangeMatch(
                    userOutput,
                    config.checkerOptions.min,
                    config.checkerOptions.max
                );

            case 'multiple':
                if (!config.checkerOptions?.validOutputs) {
                    throw new Error('Multiple checker requires validOutputs option');
                }
                return CustomChecker.multipleValidOutputs(
                    userOutput,
                    config.checkerOptions.validOutputs
                );

            case 'regex':
                if (!config.checkerOptions?.pattern) {
                    throw new Error('Regex checker requires pattern option');
                }
                return CustomChecker.regexMatch(userOutput, config.checkerOptions.pattern);

            case 'json':
                return CustomChecker.jsonMatch(userOutput, expectedOutput);

            case 'graph':
                return CustomChecker.graphMatch(userOutput, expectedOutput);

            default:
                // Default to exact match
                return CustomChecker.exactMatch(userOutput, expectedOutput);
        }
    }

    /**
     * Determine overall verdict from test case results
     */
    private static determineVerdict(results: TestCaseResult[]): Verdict {
        if (results.length === 0) {
            return 'SYSTEM_ERROR';
        }

        // Priority order (highest to lowest)
        const verdictPriority: Verdict[] = [
            'COMPILATION_ERROR',
            'SYSTEM_ERROR',
            'RUNTIME_ERROR',
            'TIME_LIMIT_EXCEEDED',
            'MEMORY_LIMIT_EXCEEDED',
            'WRONG_ANSWER',
            'ACCEPTED'
        ];

        for (const verdict of verdictPriority) {
            if (results.some(r => r.verdict === verdict)) {
                return verdict;
            }
        }

        return 'ACCEPTED';
    }

    /**
     * Sanitize error messages (remove sensitive info)
     */
    private static sanitizeError(stderr: string): string {
        // Remove file paths
        let sanitized = stderr.replace(/\/[^\s]+\//g, '');

        // Limit length
        if (sanitized.length > 500) {
            sanitized = sanitized.substring(0, 500) + '...';
        }

        return sanitized;
    }

    /**
     * Create test case from simple input/output
     */
    public static createTestCase(
        id: number,
        input: string,
        expectedOutput: string,
        isHidden: boolean = false,
        timeLimit: number = 2000,
        memoryLimit: number = 256
    ): TestCase {
        return {
            id,
            input,
            expectedOutput,
            isHidden,
            timeLimit,
            memoryLimit
        };
    }

    /**
     * Create default problem config
     */
    public static createDefaultConfig(): ProblemConfig {
        return {
            checkerType: 'exact',
            showHiddenOutputs: false,
            partialCredit: false
        };
    }
}

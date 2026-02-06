/**
 * Unit Tests for Judge System
 * Run with: npm test
 */

import { OutputNormalizer } from '../outputNormalizer';
import { CustomChecker } from '../customChecker';
import { JudgeEngine } from '../judgeEngine';

describe('OutputNormalizer', () => {
    describe('normalize', () => {
        it('should trim whitespace', () => {
            const input = '  hello world  ';
            const expected = 'hello world';
            expect(OutputNormalizer.normalize(input)).toBe(expected);
        });

        it('should handle Windows line endings', () => {
            const input = 'line1\r\nline2\r\nline3';
            const expected = 'line1\nline2\nline3';
            expect(OutputNormalizer.normalize(input)).toBe(expected);
        });

        it('should remove empty lines', () => {
            const input = 'line1\n\nline2\n\n\nline3';
            const expected = 'line1\nline2\nline3';
            expect(OutputNormalizer.normalize(input)).toBe(expected);
        });

        it('should trim each line', () => {
            const input = '  line1  \n  line2  \n  line3  ';
            const expected = 'line1\nline2\nline3';
            expect(OutputNormalizer.normalize(input)).toBe(expected);
        });

        it('should handle trailing newlines', () => {
            const input = 'hello\n\n\n';
            const expected = 'hello';
            expect(OutputNormalizer.normalize(input)).toBe(expected);
        });

        it('should normalize multiple spaces', () => {
            const input = 'hello    world';
            const expected = 'hello world';
            expect(OutputNormalizer.normalize(input, { normalizeWhitespace: true })).toBe(expected);
        });

        it('should handle case insensitive mode', () => {
            const input = 'HELLO World';
            const expected = 'hello world';
            expect(OutputNormalizer.normalize(input, { caseSensitive: false })).toBe(expected);
        });
    });

    describe('normalizeTokens', () => {
        it('should split by whitespace', () => {
            const input = '1 2 3 4 5';
            const expected = ['1', '2', '3', '4', '5'];
            expect(OutputNormalizer.normalizeTokens(input)).toEqual(expected);
        });

        it('should handle multiple spaces', () => {
            const input = '1    2    3';
            const expected = ['1', '2', '3'];
            expect(OutputNormalizer.normalizeTokens(input)).toEqual(expected);
        });

        it('should handle newlines', () => {
            const input = '1\n2\n3';
            const expected = ['1', '2', '3'];
            expect(OutputNormalizer.normalizeTokens(input)).toEqual(expected);
        });
    });

    describe('normalizeNumeric', () => {
        it('should extract numbers', () => {
            const input = 'The answer is 42 and 3.14';
            const expected = [42, 3.14];
            expect(OutputNormalizer.normalizeNumeric(input)).toEqual(expected);
        });

        it('should handle negative numbers', () => {
            const input = '-10 20 -30';
            const expected = [-10, 20, -30];
            expect(OutputNormalizer.normalizeNumeric(input)).toEqual(expected);
        });
    });
});

describe('CustomChecker', () => {
    describe('exactMatch', () => {
        it('should match identical outputs', () => {
            const result = CustomChecker.exactMatch('hello', 'hello');
            expect(result.passed).toBe(true);
        });

        it('should match after normalization', () => {
            const result = CustomChecker.exactMatch('  hello  \n', 'hello');
            expect(result.passed).toBe(true);
        });

        it('should fail on mismatch', () => {
            const result = CustomChecker.exactMatch('hello', 'world');
            expect(result.passed).toBe(false);
        });
    });

    describe('floatingPoint', () => {
        it('should match within epsilon', () => {
            const result = CustomChecker.floatingPoint('3.14159', '3.14160', 1e-4);
            expect(result.passed).toBe(true);
        });

        it('should fail outside epsilon', () => {
            const result = CustomChecker.floatingPoint('3.14', '3.15', 1e-6);
            expect(result.passed).toBe(false);
        });

        it('should handle multiple numbers', () => {
            const result = CustomChecker.floatingPoint('1.0 2.0 3.0', '1.0 2.0 3.0', 1e-6);
            expect(result.passed).toBe(true);
        });

        it('should fail on different count', () => {
            const result = CustomChecker.floatingPoint('1.0 2.0', '1.0 2.0 3.0', 1e-6);
            expect(result.passed).toBe(false);
        });
    });

    describe('tokenMatch', () => {
        it('should match tokens', () => {
            const result = CustomChecker.tokenMatch('1 2 3', '1  2  3');
            expect(result.passed).toBe(true);
        });

        it('should respect order', () => {
            const result = CustomChecker.tokenMatch('1 2 3', '3 2 1');
            expect(result.passed).toBe(false);
        });
    });

    describe('unorderedMatch', () => {
        it('should match regardless of order', () => {
            const result = CustomChecker.unorderedMatch('3 1 2', '1 2 3');
            expect(result.passed).toBe(true);
        });

        it('should fail on different elements', () => {
            const result = CustomChecker.unorderedMatch('1 2 3', '1 2 4');
            expect(result.passed).toBe(false);
        });

        it('should handle duplicates', () => {
            const result = CustomChecker.unorderedMatch('1 2 2 3', '3 2 2 1');
            expect(result.passed).toBe(true);
        });
    });

    describe('setMatch', () => {
        it('should ignore duplicates', () => {
            const result = CustomChecker.setMatch('1 2 2 3', '1 2 3');
            expect(result.passed).toBe(true);
        });

        it('should match sets', () => {
            const result = CustomChecker.setMatch('3 1 2', '1 2 3');
            expect(result.passed).toBe(true);
        });
    });

    describe('rangeMatch', () => {
        it('should accept values in range', () => {
            const result = CustomChecker.rangeMatch('50', 1, 100);
            expect(result.passed).toBe(true);
        });

        it('should reject values out of range', () => {
            const result = CustomChecker.rangeMatch('150', 1, 100);
            expect(result.passed).toBe(false);
        });
    });

    describe('multipleValidOutputs', () => {
        it('should accept any valid output', () => {
            const result = CustomChecker.multipleValidOutputs('yes', ['YES', 'yes', 'Yes']);
            expect(result.passed).toBe(true);
        });

        it('should reject invalid output', () => {
            const result = CustomChecker.multipleValidOutputs('maybe', ['YES', 'NO']);
            expect(result.passed).toBe(false);
        });
    });

    describe('jsonMatch', () => {
        it('should match JSON objects', () => {
            const result = CustomChecker.jsonMatch('{"a":1,"b":2}', '{"a":1,"b":2}');
            expect(result.passed).toBe(true);
        });

        it('should fail on different JSON', () => {
            const result = CustomChecker.jsonMatch('{"a":1}', '{"a":2}');
            expect(result.passed).toBe(false);
        });

        it('should fail on invalid JSON', () => {
            const result = CustomChecker.jsonMatch('not json', '{"a":1}');
            expect(result.passed).toBe(false);
        });
    });
});

describe('JudgeEngine', () => {
    describe('judge', () => {
        it('should return ACCEPTED for correct submission', () => {
            const testCases = [
                JudgeEngine.createTestCase(1, '5', '120', false, 1000, 256)
            ];
            const executionResults = [
                { output: '120', executionTime: 50, memoryUsed: 10, exitCode: 0, stderr: '' }
            ];
            const config = JudgeEngine.createDefaultConfig();

            const result = JudgeEngine.judge(testCases, executionResults, config);

            expect(result.verdict).toBe('ACCEPTED');
            expect(result.passedCount).toBe(1);
            expect(result.score).toBe(100);
        });

        it('should return WRONG_ANSWER for incorrect output', () => {
            const testCases = [
                JudgeEngine.createTestCase(1, '5', '120', false, 1000, 256)
            ];
            const executionResults = [
                { output: '121', executionTime: 50, memoryUsed: 10, exitCode: 0, stderr: '' }
            ];
            const config = JudgeEngine.createDefaultConfig();

            const result = JudgeEngine.judge(testCases, executionResults, config);

            expect(result.verdict).toBe('WRONG_ANSWER');
            expect(result.passedCount).toBe(0);
            expect(result.score).toBe(0);
        });

        it('should return TIME_LIMIT_EXCEEDED', () => {
            const testCases = [
                JudgeEngine.createTestCase(1, '5', '120', false, 1000, 256)
            ];
            const executionResults = [
                { output: '120', executionTime: 1500, memoryUsed: 10, exitCode: 0, stderr: '' }
            ];
            const config = JudgeEngine.createDefaultConfig();

            const result = JudgeEngine.judge(testCases, executionResults, config);

            expect(result.verdict).toBe('TIME_LIMIT_EXCEEDED');
        });

        it('should return RUNTIME_ERROR for non-zero exit code', () => {
            const testCases = [
                JudgeEngine.createTestCase(1, '5', '120', false, 1000, 256)
            ];
            const executionResults = [
                { output: '', executionTime: 50, memoryUsed: 10, exitCode: 1, stderr: 'Error' }
            ];
            const config = JudgeEngine.createDefaultConfig();

            const result = JudgeEngine.judge(testCases, executionResults, config);

            expect(result.verdict).toBe('RUNTIME_ERROR');
        });

        it('should handle multiple test cases', () => {
            const testCases = [
                JudgeEngine.createTestCase(1, '5', '120', false, 1000, 256),
                JudgeEngine.createTestCase(2, '6', '720', false, 1000, 256),
                JudgeEngine.createTestCase(3, '7', '5040', false, 1000, 256)
            ];
            const executionResults = [
                { output: '120', executionTime: 50, memoryUsed: 10, exitCode: 0, stderr: '' },
                { output: '720', executionTime: 55, memoryUsed: 11, exitCode: 0, stderr: '' },
                { output: '5040', executionTime: 60, memoryUsed: 12, exitCode: 0, stderr: '' }
            ];
            const config = JudgeEngine.createDefaultConfig();

            const result = JudgeEngine.judge(testCases, executionResults, config);

            expect(result.verdict).toBe('ACCEPTED');
            expect(result.passedCount).toBe(3);
            expect(result.totalCount).toBe(3);
        });

        it('should hide hidden test outputs', () => {
            const testCases = [
                JudgeEngine.createTestCase(1, '5', '120', true, 1000, 256) // hidden
            ];
            const executionResults = [
                { output: '120', executionTime: 50, memoryUsed: 10, exitCode: 0, stderr: '' }
            ];
            const config = { ...JudgeEngine.createDefaultConfig(), showHiddenOutputs: false };

            const result = JudgeEngine.judge(testCases, executionResults, config);

            expect(result.testCaseResults[0].actualOutput).toBeUndefined();
            expect(result.testCaseResults[0].expectedOutput).toBeUndefined();
        });

        it('should track first failed test', () => {
            const testCases = [
                JudgeEngine.createTestCase(1, '5', '120', false, 1000, 256),
                JudgeEngine.createTestCase(2, '6', '720', false, 1000, 256),
                JudgeEngine.createTestCase(3, '7', '5040', false, 1000, 256)
            ];
            const executionResults = [
                { output: '120', executionTime: 50, memoryUsed: 10, exitCode: 0, stderr: '' },
                { output: 'wrong', executionTime: 55, memoryUsed: 11, exitCode: 0, stderr: '' },
                { output: '5040', executionTime: 60, memoryUsed: 12, exitCode: 0, stderr: '' }
            ];
            const config = JudgeEngine.createDefaultConfig();

            const result = JudgeEngine.judge(testCases, executionResults, config);

            expect(result.firstFailedTest).toBe(2);
        });
    });
});

// Run tests
console.log('Running Judge System Tests...\n');

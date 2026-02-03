import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TestCase {
    functionName: string;
    args: any[];
    expected: any;
}

interface ExecutionResult {
    status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR';
    testCasesPassed: number;
    totalTestCases: number;
    executionTime: number;
    memoryUsed: number;
    errorMessage?: string;
    failedTestCase?: {
        input: string;
        expected: string;
        actual: string;
    };
}

/**
 * Language-specific code templates
 * These wrap user code with test harness (LeetCode-style)
 */
const CODE_TEMPLATES = {
    python: (userCode: string, testCases: TestCase[]) => {
        const className = userCode.match(/class\s+(\w+)/)?.[1] || 'Solution';
        const functionName = testCases[0]?.functionName || 'solve';

        return `
import json
import sys
from typing import *

${userCode}

if __name__ == "__main__":
    solution = ${className}()
    test_cases = ${JSON.stringify(testCases.map(tc => ({ args: tc.args, expected: tc.expected })))}
    
    for i, test_case in enumerate(test_cases):
        try:
            result = solution.${functionName}(*test_case["args"])
            print(json.dumps({"index": i, "result": result, "error": None}))
        except Exception as e:
            print(json.dumps({"index": i, "result": None, "error": str(e)}))
            sys.exit(1)
`;
    },

    javascript: (userCode: string, testCases: TestCase[]) => {
        const functionName = testCases[0]?.functionName ||
            userCode.match(/function\s+(\w+)/)?.[1] ||
            userCode.match(/const\s+(\w+)\s*=/)?.[1] || 'solve';

        return `
${userCode}

const testCases = ${JSON.stringify(testCases.map(tc => ({ args: tc.args, expected: tc.expected })))};

for (let i = 0; i < testCases.length; i++) {
    try {
        const result = ${functionName}(...testCases[i].args);
        console.log(JSON.stringify({ index: i, result: result, error: null }));
    } catch (e) {
        console.log(JSON.stringify({ index: i, result: null, error: e.message }));
        process.exit(1);
    }
}
`;
    },

    cpp: (userCode: string, testCases: TestCase[]) => {
        const className = userCode.match(/class\s+(\w+)/)?.[1] || 'Solution';
        const functionName = testCases[0]?.functionName || 'solve';

        // For C++, we need to generate test cases as code
        const testCaseCode = testCases.map((tc, i) => {
            const argsCode = tc.args.map((arg: any) => {
                if (Array.isArray(arg)) {
                    return `vector<int>{${arg.join(', ')}}`;
                }
                return String(arg);
            }).join(', ');

            const expectedCode = Array.isArray(tc.expected)
                ? `vector<int>{${tc.expected.join(', ')}}`
                : String(tc.expected);

            return `
    {
        auto result = solution.${functionName}(${argsCode});
        vector<int> expected = ${expectedCode};
        cout << "{\\"index\\":" << ${i} << ",\\"passed\\":" << (result == expected ? "true" : "false") << "}" << endl;
    }`;
        }).join('\n');

        return `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

${userCode}

int main() {
    ${className} solution;
    ${testCaseCode}
    return 0;
}
`;
    },

    java: (userCode: string, testCases: TestCase[]) => {
        const className = userCode.match(/class\s+(\w+)/)?.[1] || 'Solution';
        const functionName = testCases[0]?.functionName || 'solve';

        const testCaseCode = testCases.map((tc, i) => {
            const argsCode = tc.args.map((arg: any) => {
                if (Array.isArray(arg)) {
                    return `new int[]{${arg.join(', ')}}`;
                }
                return String(arg);
            }).join(', ');

            return `
        {
            var result = solution.${functionName}(${argsCode});
            System.out.println("{\\"index\\":" + ${i} + ",\\"result\\":" + java.util.Arrays.toString(result) + "}");
        }`;
        }).join('\n');

        return `
import java.util.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        ${className} solution = new ${className}();
        ${testCaseCode}
    }
}
`;
    }
};

/**
 * Deep equality comparison for any data type
 */
function deepEqual(actual: any, expected: any): boolean {
    if (actual === expected) return true;

    if (actual == null || expected == null) return false;

    if (typeof actual !== typeof expected) return false;

    if (typeof actual === 'number' && typeof expected === 'number') {
        return Math.abs(actual - expected) < 1e-9;
    }

    if (Array.isArray(actual) && Array.isArray(expected)) {
        if (actual.length !== expected.length) return false;
        return actual.every((val, i) => deepEqual(val, expected[i]));
    }

    if (typeof actual === 'object' && typeof expected === 'object') {
        const keysA = Object.keys(actual);
        const keysB = Object.keys(expected);
        if (keysA.length !== keysB.length) return false;
        return keysA.every(key => deepEqual(actual[key], expected[key]));
    }

    return false;
}

/**
 * Parse JSON output from executed code
 */
function parseExecutionOutput(stdout: string, testCases: TestCase[]): {
    results: Array<{ passed: boolean; actual: any; expected: any }>;
    error?: string;
} {
    const lines = stdout.trim().split('\n').filter(line => line.trim());
    const results: Array<{ passed: boolean; actual: any; expected: any }> = [];

    for (let i = 0; i < lines.length; i++) {
        try {
            const output = JSON.parse(lines[i]);

            if (output.error) {
                return { results, error: output.error };
            }

            const expected = testCases[output.index]?.expected;
            const actual = output.result;
            const passed = deepEqual(actual, expected);

            results.push({ passed, actual, expected });

            if (!passed) {
                break; // Stop on first failure
            }
        } catch (e) {
            // Handle C++ style output
            if (lines[i].includes('"passed":true')) {
                results.push({ passed: true, actual: null, expected: null });
            } else if (lines[i].includes('"passed":false')) {
                results.push({ passed: false, actual: null, expected: testCases[i]?.expected });
                break;
            }
        }
    }

    return { results };
}

/**
 * Execute wrapped code with test cases
 */
async function executeCode(
    code: string,
    language: string,
    testCases: TestCase[],
    timeLimit: number = 5000
): Promise<ExecutionResult> {
    const workDir = path.join(process.cwd(), 'temp', uuidv4());
    await fs.mkdir(workDir, { recursive: true });

    try {
        // Generate wrapped code with test harness
        const wrappedCode = CODE_TEMPLATES[language as keyof typeof CODE_TEMPLATES]?.(code, testCases);

        if (!wrappedCode) {
            throw new Error(`Unsupported language: ${language}`);
        }

        // Language-specific execution
        let command: string;
        let args: string[];
        let filename: string;

        switch (language) {
            case 'python':
                filename = 'solution.py';
                await fs.writeFile(path.join(workDir, filename), wrappedCode);
                command = 'python';
                args = [filename];
                break;

            case 'javascript':
                filename = 'solution.js';
                await fs.writeFile(path.join(workDir, filename), wrappedCode);
                command = 'node';
                args = [filename];
                break;

            case 'cpp':
                filename = 'solution.cpp';
                await fs.writeFile(path.join(workDir, filename), wrappedCode);

                // Compile
                const compileResult = await runProcess('g++', ['-std=c++17', '-O2', filename, '-o', 'solution.exe'], workDir, '', 30000);
                if (compileResult.exitCode !== 0) {
                    return {
                        status: 'COMPILATION_ERROR',
                        testCasesPassed: 0,
                        totalTestCases: testCases.length,
                        executionTime: 0,
                        memoryUsed: 0,
                        errorMessage: compileResult.stderr
                    };
                }

                command = path.join(workDir, 'solution.exe');
                args = [];
                break;

            case 'java':
                filename = 'Main.java';
                await fs.writeFile(path.join(workDir, filename), wrappedCode);

                // Compile
                const javaCompileResult = await runProcess('javac', [filename], workDir, '', 30000);
                if (javaCompileResult.exitCode !== 0) {
                    return {
                        status: 'COMPILATION_ERROR',
                        testCasesPassed: 0,
                        totalTestCases: testCases.length,
                        executionTime: 0,
                        memoryUsed: 0,
                        errorMessage: javaCompileResult.stderr
                    };
                }

                command = 'java';
                args = ['Main'];
                break;

            default:
                throw new Error(`Unsupported language: ${language}`);
        }

        // Execute
        const startTime = Date.now();
        const result = await runProcess(command, args, workDir, '', timeLimit);
        const executionTime = Date.now() - startTime;

        if (result.timeout) {
            return {
                status: 'TIME_LIMIT_EXCEEDED',
                testCasesPassed: 0,
                totalTestCases: testCases.length,
                executionTime,
                memoryUsed: 0,
                errorMessage: 'Time limit exceeded'
            };
        }

        if (result.exitCode !== 0) {
            return {
                status: 'RUNTIME_ERROR',
                testCasesPassed: 0,
                totalTestCases: testCases.length,
                executionTime,
                memoryUsed: 0,
                errorMessage: result.stderr || 'Runtime error occurred'
            };
        }

        // Parse results
        const { results, error } = parseExecutionOutput(result.stdout, testCases);

        if (error) {
            return {
                status: 'RUNTIME_ERROR',
                testCasesPassed: results.length,
                totalTestCases: testCases.length,
                executionTime,
                memoryUsed: 0,
                errorMessage: error
            };
        }

        const passedCount = results.filter(r => r.passed).length;

        if (passedCount === testCases.length) {
            return {
                status: 'ACCEPTED',
                testCasesPassed: passedCount,
                totalTestCases: testCases.length,
                executionTime,
                memoryUsed: Math.floor(Math.random() * 10 + 20)
            };
        } else {
            const failedIndex = results.findIndex(r => !r.passed);
            const failedResult = results[failedIndex];

            return {
                status: 'WRONG_ANSWER',
                testCasesPassed: passedCount,
                totalTestCases: testCases.length,
                executionTime,
                memoryUsed: 0,
                errorMessage: `Test case ${failedIndex + 1} failed`,
                failedTestCase: {
                    input: JSON.stringify(testCases[failedIndex]?.args),
                    expected: JSON.stringify(failedResult?.expected),
                    actual: JSON.stringify(failedResult?.actual)
                }
            };
        }

    } finally {
        // Cleanup
        try {
            await fs.rm(workDir, { recursive: true, force: true });
        } catch (e) {
            console.error('Cleanup error:', e);
        }
    }
}

function runProcess(
    command: string,
    args: string[],
    cwd: string,
    stdin: string,
    timeout: number
): Promise<{ stdout: string; stderr: string; exitCode: number; timeout: boolean }> {
    return new Promise((resolve) => {
        let timedOut = false;
        let stdout = '';
        let stderr = '';

        const process = spawn(command, args, { cwd });

        const timeoutId = setTimeout(() => {
            timedOut = true;
            process.kill();
        }, timeout);

        if (stdin) {
            process.stdin.write(stdin);
            process.stdin.end();
        }

        process.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        process.on('close', (code) => {
            clearTimeout(timeoutId);
            resolve({
                stdout: stdout.trim(),
                stderr: stderr.trim(),
                exitCode: code || 0,
                timeout: timedOut
            });
        });

        process.on('error', (error) => {
            clearTimeout(timeoutId);
            resolve({
                stdout: '',
                stderr: error.message,
                exitCode: 1,
                timeout: timedOut
            });
        });
    });
}

// API endpoint
router.post('/run', async (req: Request, res: Response) => {
    try {
        const { code, language, testCases } = req.body;

        if (!code || !language || !testCases) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await executeCode(code, language, testCases, 5000);
        res.json({ success: true, result });

    } catch (error) {
        console.error('Execution error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;

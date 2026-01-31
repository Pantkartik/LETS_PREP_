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
    input: string;
    expected_output: string;
}

interface ExecutionResult {
    status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR';
    testCasesPassed: number;
    totalTestCases: number;
    executionTime: number;
    memoryUsed: number;
    errorMessage?: string;
}

// Language configurations for local execution
const LANGUAGE_CONFIG = {
    python: {
        extension: '.py',
        command: 'python',
        args: (file: string) => [file]
    },
    javascript: {
        extension: '.js',
        command: 'node',
        args: (file: string) => [file]
    },
    cpp: {
        extension: '.cpp',
        command: 'g++',
        compileArgs: (file: string, output: string) => ['-std=c++17', '-O2', file, '-o', output],
        runCommand: (output: string) => output
    },
    java: {
        extension: '.java',
        command: 'javac',
        compileArgs: (file: string) => [file],
        runCommand: (className: string) => 'java',
        runArgs: (className: string) => [className]
    }
};

async function executeCode(
    code: string,
    language: string,
    testCases: TestCase[],
    timeLimit: number = 2000
): Promise<ExecutionResult> {
    const config = LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG];
    if (!config) {
        throw new Error(`Unsupported language: ${language}`);
    }

    const workDir = path.join(process.cwd(), 'temp', uuidv4());
    await fs.mkdir(workDir, { recursive: true });

    try {
        let filename = `Solution${config.extension}`;
        if (language === 'java') {
            const classMatch = code.match(/public\s+class\s+(\w+)/);
            if (classMatch) {
                filename = `${classMatch[1]}${config.extension}`;
            }
        }

        const filePath = path.join(workDir, filename);
        await fs.writeFile(filePath, code);

        // Compilation step for C++ and Java
        if (language === 'cpp' || language === 'java') {
            const outputFile = language === 'cpp' ? path.join(workDir, 'program.exe') : '';
            const compileArgs = language === 'cpp'
                ? config.compileArgs!(filePath, outputFile)
                : config.compileArgs!(filePath);

            const compileResult = await runProcess(
                config.command,
                compileArgs,
                workDir,
                '',
                30000
            );

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
        }

        // Execute test cases
        let passedTests = 0;
        let totalTime = 0;

        for (const testCase of testCases) {
            let command: string;
            let args: string[];

            if (language === 'cpp') {
                command = path.join(workDir, 'program.exe');
                args = [];
            } else if (language === 'java') {
                command = 'java';
                args = [filename.replace('.java', '')];
            } else {
                command = config.command;
                args = config.args(filePath);
            }

            const startTime = Date.now();
            const result = await runProcess(
                command,
                args,
                workDir,
                testCase.input,
                timeLimit
            );
            const endTime = Date.now();

            totalTime += (endTime - startTime);

            if (result.timeout) {
                return {
                    status: 'TIME_LIMIT_EXCEEDED',
                    testCasesPassed: passedTests,
                    totalTestCases: testCases.length,
                    executionTime: totalTime,
                    memoryUsed: 0,
                    errorMessage: 'Time limit exceeded'
                };
            }

            if (result.exitCode !== 0) {
                return {
                    status: 'RUNTIME_ERROR',
                    testCasesPassed: passedTests,
                    totalTestCases: testCases.length,
                    executionTime: totalTime,
                    memoryUsed: 0,
                    errorMessage: result.stderr
                };
            }

            const actualOutput = result.stdout.trim();
            const expectedOutput = testCase.expected_output.trim();

            if (actualOutput === expectedOutput) {
                passedTests++;
            } else {
                return {
                    status: 'WRONG_ANSWER',
                    testCasesPassed: passedTests,
                    totalTestCases: testCases.length,
                    executionTime: totalTime,
                    memoryUsed: 0,
                    errorMessage: `Expected: ${expectedOutput}\nGot: ${actualOutput}`
                };
            }
        }

        return {
            status: 'ACCEPTED',
            testCasesPassed: passedTests,
            totalTestCases: testCases.length,
            executionTime: totalTime,
            memoryUsed: 0
        };

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

// API endpoint to process submissions
router.post('/execute', async (req: Request, res: Response) => {
    try {
        const { submissionId } = req.body;

        if (!submissionId) {
            return res.status(400).json({ error: 'Submission ID required' });
        }

        // Fetch submission details
        const { data: submission, error: subError } = await supabase
            .from('competition_submissions')
            .select(`
                *,
                problems(test_cases, time_limit_ms, memory_limit_mb)
            `)
            .eq('id', submissionId)
            .single();

        if (subError || !submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        const problem = (submission as any).problems;
        const testCases: TestCase[] = problem.test_cases || [];

        // Execute code
        const result = await executeCode(
            submission.code,
            submission.language,
            testCases,
            problem.time_limit_ms || 2000
        );

        // Update submission in database
        await supabase
            .from('competition_submissions')
            .update({
                status: result.status,
                test_cases_passed: result.testCasesPassed,
                total_test_cases: result.totalTestCases,
                execution_time: result.executionTime,
                memory_used: result.memoryUsed,
                error_message: result.errorMessage,
                evaluated_at: new Date().toISOString()
            })
            .eq('id', submissionId);

        // Process submission result (update rankings, etc.)
        await supabase.rpc('process_submission', {
            sub_id: submissionId,
            is_correct: result.status === 'ACCEPTED',
            exec_time: result.executionTime,
            test_passed: result.testCasesPassed,
            test_total: result.totalTestCases
        });

        res.json({ success: true, result });

    } catch (error) {
        console.error('Execution error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Health check
router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', executor: 'local' });
});

export default router;

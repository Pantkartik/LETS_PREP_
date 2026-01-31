import express from 'express';
import { createClient } from '@supabase/supabase-js';
import Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

const app = express();
app.use(express.json({ limit: '10mb' }));

const docker = new Docker();
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Language configurations
const LANGUAGE_CONFIG = {
    python: {
        image: 'python:3.11-slim',
        extension: '.py',
        compile: null,
        execute: (filename: string) => ['python3', filename]
    },
    javascript: {
        image: 'node:18-slim',
        extension: '.js',
        compile: null,
        execute: (filename: string) => ['node', filename]
    },
    cpp: {
        image: 'gcc:latest',
        extension: '.cpp',
        compile: (filename: string) => ['g++', '-std=c++17', '-O2', filename, '-o', 'program'],
        execute: () => ['./program']
    },
    java: {
        image: 'openjdk:17-slim',
        extension: '.java',
        compile: (filename: string) => ['javac', filename],
        execute: (className: string) => ['java', className]
    }
};

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

async function executeCode(
    code: string,
    language: string,
    testCases: TestCase[],
    timeLimit: number = 2000,
    memoryLimit: number = 256
): Promise<ExecutionResult> {
    const config = LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG];
    if (!config) {
        throw new Error(`Unsupported language: ${language}`);
    }

    const workDir = `/tmp/code_exec_${uuidv4()}`;
    await fs.mkdir(workDir, { recursive: true });

    try {
        // Determine filename
        let filename = `Solution${config.extension}`;
        if (language === 'java') {
            const classMatch = code.match(/public\s+class\s+(\w+)/);
            if (classMatch) {
                filename = `${classMatch[1]}${config.extension}`;
            }
        }

        const filePath = path.join(workDir, filename);
        await fs.writeFile(filePath, code);

        // Compilation step (if needed)
        if (config.compile) {
            const compileCmd = config.compile(filename);
            const compileResult = await runInDocker(
                config.image,
                workDir,
                compileCmd,
                '',
                30000, // 30 seconds for compilation
                memoryLimit
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
        let maxMemory = 0;

        for (const testCase of testCases) {
            const executeCmd = config.execute(language === 'java' ? filename.replace('.java', '') : filename);

            const startTime = Date.now();
            const result = await runInDocker(
                config.image,
                workDir,
                executeCmd,
                testCase.input,
                timeLimit,
                memoryLimit
            );
            const endTime = Date.now();

            totalTime += (endTime - startTime);
            maxMemory = Math.max(maxMemory, result.memoryUsed);

            if (result.timeout) {
                return {
                    status: 'TIME_LIMIT_EXCEEDED',
                    testCasesPassed: passedTests,
                    totalTestCases: testCases.length,
                    executionTime: totalTime,
                    memoryUsed: maxMemory,
                    errorMessage: 'Time limit exceeded'
                };
            }

            if (result.exitCode !== 0) {
                return {
                    status: 'RUNTIME_ERROR',
                    testCasesPassed: passedTests,
                    totalTestCases: testCases.length,
                    executionTime: totalTime,
                    memoryUsed: maxMemory,
                    errorMessage: result.stderr
                };
            }

            // Compare output (trim whitespace)
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
                    memoryUsed: maxMemory,
                    errorMessage: `Expected: ${expectedOutput}\nGot: ${actualOutput}`
                };
            }
        }

        return {
            status: 'ACCEPTED',
            testCasesPassed: passedTests,
            totalTestCases: testCases.length,
            executionTime: totalTime,
            memoryUsed: maxMemory
        };

    } finally {
        // Cleanup
        await fs.rm(workDir, { recursive: true, force: true });
    }
}

async function runInDocker(
    image: string,
    workDir: string,
    cmd: string[],
    stdin: string,
    timeout: number,
    memoryLimit: number
): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
    timeout: boolean;
    memoryUsed: number;
}> {
    return new Promise(async (resolve) => {
        let timedOut = false;
        let stdout = '';
        let stderr = '';

        const container = await docker.createContainer({
            Image: image,
            Cmd: cmd,
            WorkingDir: '/workspace',
            HostConfig: {
                Binds: [`${workDir}:/workspace`],
                Memory: memoryLimit * 1024 * 1024, // Convert MB to bytes
                NetworkMode: 'none', // No network access
                AutoRemove: true
            },
            OpenStdin: true,
            StdinOnce: true
        });

        const timeoutId = setTimeout(async () => {
            timedOut = true;
            try {
                await container.kill();
            } catch (e) {
                // Container might already be stopped
            }
        }, timeout);

        try {
            await container.start();

            // Send stdin if provided
            if (stdin) {
                const stream = await container.attach({
                    stream: true,
                    stdin: true,
                    stdout: true,
                    stderr: true
                });

                stream.write(stdin);
                stream.end();

                stream.on('data', (chunk: Buffer) => {
                    const str = chunk.toString();
                    if (str.includes('stdout')) {
                        stdout += str;
                    } else {
                        stderr += str;
                    }
                });
            }

            const result = await container.wait();
            clearTimeout(timeoutId);

            // Get stats for memory usage
            const stats = await container.stats({ stream: false });
            const memoryUsed = Math.round((stats.memory_stats?.usage || 0) / 1024); // Convert to KB

            resolve({
                stdout: stdout.trim(),
                stderr: stderr.trim(),
                exitCode: result.StatusCode,
                timeout: timedOut,
                memoryUsed
            });

        } catch (error) {
            clearTimeout(timeoutId);
            resolve({
                stdout: '',
                stderr: error instanceof Error ? error.message : 'Unknown error',
                exitCode: 1,
                timeout: timedOut,
                memoryUsed: 0
            });
        }
    });
}

// API endpoint to process submissions
app.post('/execute', async (req, res) => {
    try {
        const { submissionId } = req.body;

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
            problem.time_limit_ms || 2000,
            problem.memory_limit_mb || 256
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
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Code execution engine running on port ${PORT}`);
});

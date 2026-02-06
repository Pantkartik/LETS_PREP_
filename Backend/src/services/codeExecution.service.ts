import Docker from 'dockerode';
import { logger } from '../config/logger';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { QueueService } from './queue.service';

export interface CodeExecutionRequest {
    code: string;
    language: string;
    testCases: Array<{
        input: string;
        expectedOutput: string;
        isHidden?: boolean;
    }>;
    timeLimit?: number; // in milliseconds
    memoryLimit?: number; // in MB
}

export interface TestCaseResult {
    testCaseId: number;
    passed: boolean;
    actualOutput?: string;
    expectedOutput: string;
    executionTime: number;
    memoryUsed: number;
    error?: string;
}

export interface CodeExecutionResult {
    status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR' | 'SYSTEM_ERROR';
    testCaseResults: TestCaseResult[];
    passedCount: number;
    totalCount: number;
    executionTime: number;
    memoryUsed: number;
    errorMessage?: string;
    errorLine?: number;
}

// Language configuration types for local execution
type BaseLanguageConfig = {
    extension: string;
    command: string;
};

type InterpretedLanguageConfig = BaseLanguageConfig & {
    args: (file: string) => string[];
};

type CompiledLanguageConfig = BaseLanguageConfig & {
    compileArgs: (file: string, output: string) => string[];
    runCommand: (output: string) => string;
    runArgs?: (className: string) => string[];
};

type LanguageConfig = InterpretedLanguageConfig | CompiledLanguageConfig;

const LOCAL_LANGUAGE_CONFIG: Record<string, LanguageConfig> = {
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
        runCommand: (_className: string) => 'java',
        runArgs: (className: string) => [className]
    }
};

export class CodeExecutionService {
    private docker: Docker;
    private readonly defaultTimeout = parseInt(process.env.CODE_EXECUTION_TIMEOUT || '10000');
    private readonly defaultMemoryLimit = parseInt(process.env.MAX_MEMORY_MB || '256');

    constructor() {
        this.docker = new Docker();
    }

    public async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
        // If Async Execution is enabled, we should not maintain this connection.
        // However, this method signature expects a Promise<Result>.
        // For Async mode, the controller should handle the 'pending' response.

        // Try Docker if enabled, fallback to local if it fails or is disabled
        if (process.env.DOCKER_ENABLED === 'true') {
            try {
                return await this.executeWithDocker(request);
            } catch (error: any) {
                logger.warn('Docker execution failed, falling back to local execution', { error: error.message });
                return this.executeLocal(request);
            }
        }
        return this.executeLocal(request);
    }

    public async addExecutionJob(submissionId: string, request: CodeExecutionRequest): Promise<void> {
        const queueService = QueueService.getInstance();
        await queueService.addExecutionJob({
            submissionId,
            ...request
        });
    }


    private async executeWithDocker(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
        const {
            code,
            language,
            testCases,
            timeLimit = this.defaultTimeout,
            memoryLimit = this.defaultMemoryLimit,
        } = request;

        try {
            // Validate language
            if (!this.isSupportedLanguage(language)) {
                return this.createErrorResult('SYSTEM_ERROR', 'Unsupported language', testCases.length);
            }

            // Execute code for each test case
            const testCaseResults: TestCaseResult[] = [];
            let totalExecutionTime = 0;
            let maxMemoryUsed = 0;

            for (let i = 0; i < testCases.length; i++) {
                const testCase = testCases[i];

                try {
                    const result = await this.executeTestCaseDocker(
                        code,
                        language,
                        testCase.input,
                        testCase.expectedOutput,
                        timeLimit,
                        memoryLimit
                    );

                    testCaseResults.push({
                        testCaseId: i + 1,
                        ...result,
                    });

                    totalExecutionTime += result.executionTime;
                    maxMemoryUsed = Math.max(maxMemoryUsed, result.memoryUsed);

                } catch (error: any) {
                    logger.error('Test case execution error', { error, testCaseId: i + 1 });
                    testCaseResults.push({
                        testCaseId: i + 1,
                        passed: false,
                        expectedOutput: testCase.expectedOutput,
                        executionTime: 0,
                        memoryUsed: 0,
                        error: error.message,
                    });
                }
            }

            return this.aggregateResults(testCaseResults);
        } catch (error: any) {
            logger.error('Code execution error', { error });
            throw error; // Rethrow to trigger fallback
        }
    }

    private async executeLocal(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
        const { code, language, testCases, timeLimit = 2000 } = request;
        const config = LOCAL_LANGUAGE_CONFIG[language as keyof typeof LOCAL_LANGUAGE_CONFIG];

        if (!config) {
            return this.createErrorResult('SYSTEM_ERROR', `Unsupported language: ${language}`, testCases.length);
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

            // Compilation step
            if (language === 'cpp' || language === 'java') {
                const compiledConfig = config as CompiledLanguageConfig;
                const outputFile = language === 'cpp' ? path.join(workDir, 'program.exe') : '';
                const compileArgs = language === 'cpp'
                    ? compiledConfig.compileArgs(filePath, outputFile)
                    : compiledConfig.compileArgs(filePath, '');

                const compileResult = await this.runProcess(
                    config.command,
                    compileArgs,
                    workDir,
                    '',
                    30000
                );

                if (compileResult.exitCode !== 0) {
                    // Enhanced error message
                    const errorLines = compileResult.stderr.split('\n');
                    const relevantErrors = errorLines
                        .filter(line => line.includes('error') || line.includes('Error'))
                        .slice(0, 5)
                        .join('\n');

                    return {
                        status: 'COMPILATION_ERROR',
                        testCaseResults: [],
                        passedCount: 0,
                        totalCount: testCases.length,
                        executionTime: 0,
                        memoryUsed: 0,
                        errorMessage: relevantErrors || compileResult.stderr
                    };
                }
            }

            // Execute test cases
            const testCaseResults: TestCaseResult[] = await Promise.all(
                testCases.map(async (testCase, index) => {
                    let command: string;
                    let args: string[];

                    if (language === 'cpp') {
                        command = path.join(workDir, 'program.exe');
                        args = [];
                    } else if (language === 'java') {
                        command = 'java';
                        args = [filename.replace('.java', '')];
                    } else {
                        const interpretedConfig = config as InterpretedLanguageConfig;
                        command = interpretedConfig.command;
                        args = interpretedConfig.args(filePath);
                    }

                    const startTime = Date.now();
                    const result = await this.runProcess(
                        command,
                        args,
                        workDir,
                        testCase.input,
                        timeLimit
                    );
                    const executionTime = Date.now() - startTime;

                    if (result.timeout) {
                        return {
                            testCaseId: index + 1,
                            passed: false,
                            expectedOutput: testCase.expectedOutput,
                            executionTime,
                            memoryUsed: 0,
                            error: 'Time Limit Exceeded'
                        };
                    }

                    if (result.exitCode !== 0) {
                        return {
                            testCaseId: index + 1,
                            passed: false,
                            expectedOutput: testCase.expectedOutput,
                            executionTime,
                            memoryUsed: 0,
                            error: result.stderr
                        };
                    }

                    const actualOutput = result.stdout.trim();
                    const passed = this.compareOutputs(actualOutput, testCase.expectedOutput.trim());

                    return {
                        testCaseId: index + 1,
                        passed,
                        actualOutput,
                        expectedOutput: testCase.expectedOutput,
                        executionTime,
                        memoryUsed: 0 // Placeholder
                    };
                })
            );

            return this.aggregateResults(testCaseResults);

        } catch (error: any) {
            logger.error('Local execution error', { error });
            return this.createErrorResult('SYSTEM_ERROR', error.message, testCases.length);
        } finally {
            try {
                await fs.rm(workDir, { recursive: true, force: true });
            } catch (e) { console.error('Cleanup error:', e); }
        }
    }

    private runProcess(
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

            const proc = spawn(command, args, { cwd });

            const timeoutId = setTimeout(() => {
                timedOut = true;
                proc.kill();
            }, timeout);

            if (stdin) {
                proc.stdin.write(stdin);
                proc.stdin.end();
            }

            proc.stdout.on('data', (data) => { stdout += data.toString(); });
            proc.stderr.on('data', (data) => { stderr += data.toString(); });

            proc.on('close', (code) => {
                clearTimeout(timeoutId);
                resolve({
                    stdout: stdout.trim(),
                    stderr: stderr.trim(),
                    exitCode: code || 0,
                    timeout: timedOut
                });
            });

            proc.on('error', (error) => {
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

    private aggregateResults(testCaseResults: TestCaseResult[]): CodeExecutionResult {
        const passedCount = testCaseResults.filter((r) => r.passed).length;
        const totalCount = testCaseResults.length;

        let status: CodeExecutionResult['status'] = 'ACCEPTED';
        if (passedCount < totalCount) status = 'WRONG_ANSWER';

        if (testCaseResults.some(r => r.error === 'Time Limit Exceeded')) status = 'TIME_LIMIT_EXCEEDED';
        else if (testCaseResults.some(r => r.error && r.error.includes('error'))) status = 'RUNTIME_ERROR';

        const totalExecutionTime = testCaseResults.reduce((acc, r) => acc + r.executionTime, 0);
        const maxMemoryUsed = testCaseResults.reduce((acc, r) => Math.max(acc, r.memoryUsed), 0);

        return {
            status,
            testCaseResults,
            passedCount,
            totalCount,
            executionTime: totalExecutionTime,
            memoryUsed: maxMemoryUsed,
        };
    }

    private async executeTestCaseDocker(
        code: string,
        language: string,
        input: string,
        expectedOutput: string,
        timeLimit: number,
        memoryLimit: number
    ): Promise<Omit<TestCaseResult, 'testCaseId'>> {
        const startTime = Date.now();

        try {
            // Create container configuration
            const containerConfig = this.getContainerConfig(language, code, input, timeLimit, memoryLimit);

            // Create and start container
            const container = await this.docker.createContainer(containerConfig);
            await container.start();

            // Wait for container to finish with timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Execution timeout')), timeLimit);
            });

            const executionPromise = container.wait();

            await Promise.race([executionPromise, timeoutPromise]);

            // Get container logs
            const logs = await container.logs({
                stdout: true,
                stderr: true,
            });

            // Clean up container
            await container.remove({ force: true });

            const executionTime = Date.now() - startTime;
            const actualOutput = logs.toString().trim();

            // Compare output
            const passed = this.compareOutputs(actualOutput, expectedOutput.trim());

            // Get memory usage (simplified - in production, use container stats)
            const memoryUsed = 10; // Placeholder

            return {
                passed,
                actualOutput,
                expectedOutput,
                executionTime,
                memoryUsed,
            };
        } catch (error: any) {
            const executionTime = Date.now() - startTime;

            return {
                passed: false,
                expectedOutput,
                executionTime,
                memoryUsed: 0,
                error: error.message,
            };
        }
    }

    private getContainerConfig(
        language: string,
        code: string,
        input: string,
        timeLimit: number,
        memoryLimit: number
    ): any {
        const configs: Record<string, any> = {
            python: {
                Image: 'python:3.11-alpine',
                Cmd: ['python', '-c', code],
                Tty: false,
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                OpenStdin: true,
                StdinOnce: true,
                HostConfig: {
                    Memory: memoryLimit * 1024 * 1024,
                    NetworkMode: 'none',
                    AutoRemove: false,
                },
            },
            javascript: {
                Image: 'node:20-alpine',
                Cmd: ['node', '-e', code],
                Tty: false,
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                OpenStdin: true,
                StdinOnce: true,
                HostConfig: {
                    Memory: memoryLimit * 1024 * 1024,
                    NetworkMode: 'none',
                    AutoRemove: false,
                },
            },
            java: {
                Image: 'openjdk:17-alpine',
                Cmd: ['sh', '-c', `echo '${code}' > Solution.java && javac Solution.java && java Solution`],
                Tty: false,
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                OpenStdin: true,
                StdinOnce: true,
                HostConfig: {
                    Memory: memoryLimit * 1024 * 1024,
                    NetworkMode: 'none',
                    AutoRemove: false,
                },
            },
            cpp: {
                Image: 'gcc:latest',
                Cmd: ['sh', '-c', `echo '${code}' > solution.cpp && g++ solution.cpp -o solution && ./solution`],
                Tty: false,
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                OpenStdin: true,
                StdinOnce: true,
                HostConfig: {
                    Memory: memoryLimit * 1024 * 1024,
                    NetworkMode: 'none',
                    AutoRemove: false,
                },
            },
        };

        return configs[language] || configs.python;
    }

    private compareOutputs(actual: string, expected: string): boolean {
        // Normalize outputs
        const normalizeOutput = (output: string) => {
            return output
                .trim()
                .replace(/\r\n/g, '\n')
                .replace(/\s+$/gm, '')
                .toLowerCase();
        };

        return normalizeOutput(actual) === normalizeOutput(expected);
    }

    private isSupportedLanguage(language: string): boolean {
        const supportedLanguages = ['python', 'java', 'cpp', 'javascript', 'go', 'rust'];
        return supportedLanguages.includes(language.toLowerCase());
    }

    private createErrorResult(
        status: CodeExecutionResult['status'],
        errorMessage: string,
        totalCount: number
    ): CodeExecutionResult {
        return {
            status,
            testCaseResults: [],
            passedCount: 0,
            totalCount,
            executionTime: 0,
            memoryUsed: 0,
            errorMessage,
        };
    }

    public async executeWithLambda(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
        throw new Error('Lambda execution not implemented yet');
    }
}

export const codeExecutionService = new CodeExecutionService();

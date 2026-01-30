import Docker from 'dockerode';
import { logger } from '../config/logger';
import { v4 as uuidv4 } from 'uuid';

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

export class CodeExecutionService {
    private docker: Docker;
    private readonly defaultTimeout = parseInt(process.env.CODE_EXECUTION_TIMEOUT || '10000');
    private readonly defaultMemoryLimit = parseInt(process.env.MAX_MEMORY_MB || '256');

    constructor() {
        this.docker = new Docker();
    }

    public async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
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
                    const result = await this.executeTestCase(
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

                    // Stop execution if test case failed (optional optimization)
                    // if (!result.passed) break;
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

            // Determine overall status
            const passedCount = testCaseResults.filter((r) => r.passed).length;
            const totalCount = testCaseResults.length;

            let status: CodeExecutionResult['status'] = 'ACCEPTED';
            if (passedCount < totalCount) {
                status = 'WRONG_ANSWER';
            }

            // Check for time limit exceeded
            if (testCaseResults.some((r) => r.error?.includes('timeout'))) {
                status = 'TIME_LIMIT_EXCEEDED';
            }

            // Check for memory limit exceeded
            if (testCaseResults.some((r) => r.error?.includes('memory'))) {
                status = 'MEMORY_LIMIT_EXCEEDED';
            }

            return {
                status,
                testCaseResults,
                passedCount,
                totalCount,
                executionTime: totalExecutionTime,
                memoryUsed: maxMemoryUsed,
            };
        } catch (error: any) {
            logger.error('Code execution error', { error });
            return this.createErrorResult('SYSTEM_ERROR', error.message, testCases.length);
        }
    }

    private async executeTestCase(
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

    // Alternative: Execute using AWS Lambda (for production)
    public async executeWithLambda(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
        // TODO: Implement AWS Lambda execution
        // This would be more scalable for production
        throw new Error('Lambda execution not implemented yet');
    }
}

export const codeExecutionService = new CodeExecutionService();

import Docker from 'dockerode';
import { logger } from '../config/logger';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { QueueService } from './queue.service';
import { OutputNormalizer } from './judge/outputNormalizer';
import { IsolationManager } from './execution/IsolationManager';
import { TemplateEngine } from './execution/TemplateEngine';
import { Validator } from './execution/Validator';

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
    validationConfig?: {
        mode: 'exact' | 'float' | 'custom';
        epsilon?: number;
    };
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
    private isolationManager: IsolationManager;
    private readonly defaultTimeout = 2000; // 2 seconds
    private readonly defaultMemoryLimit = 256; // 256 MB

    constructor() {
        this.isolationManager = new IsolationManager();
    }

    public async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
        // Fallback to local if Docker not enabled handled by environment check usually, 
        // but here we enforce IsolationManager which uses Docker.
        // If Docker is down, IsolationManager will throw.
        try {
            const isHealthy = await this.isolationManager.checkHealth();
            if (!isHealthy) {
                // Return descriptive error instead of crash
                return {
                    status: 'SYSTEM_ERROR',
                    testCaseResults: [],
                    passedCount: 0,
                    totalCount: request.testCases.length,
                    executionTime: 0,
                    memoryUsed: 0,
                    errorMessage: 'Docker is not running or not installed. Execution engine requires Docker.'
                };
            }
            return await this.executeWithIsolation(request);
        } catch (error: any) {
            logger.error('Execution failed', error);
            return {
                status: 'SYSTEM_ERROR',
                testCaseResults: [],
                passedCount: 0,
                totalCount: request.testCases.length,
                executionTime: 0,
                memoryUsed: 0,
                errorMessage: error.message
            };
        }
    }

    private async executeWithIsolation(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
        const {
            code,
            language,
            testCases,
            timeLimit = this.defaultTimeout,
            memoryLimit = this.defaultMemoryLimit,
            validationConfig = { mode: 'exact' }
        } = request;

        const testCaseResults: TestCaseResult[] = [];
        let totalExecutionTime = 0;
        let maxMemoryUsed = 0;

        // Smart Template Selection
        // If code has entry point, use Raw Mode. Else use Template.
        let fullCode = code;
        const hasMain = this.checkEntrypoint(language, code);

        if (!hasMain) {
            // Inject into template
            // Note: Since we don't have parsers generated yet, we assume the user 
            // wrote a class that matches the template's expectations (or we fail).
            // For now, we allow the template engine to just wrap.
            fullCode = TemplateEngine.injectCode(language, code);
        }

        // Execute for each test case
        // Optimization TODO: Bundle test cases or use persistent container
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];

            try {
                // Execute Securely
                const result = await this.isolationManager.execute({
                    language,
                    code: fullCode,
                    input: testCase.input,
                    timeLimit: timeLimit / 1000, // Convert ms to seconds
                    memoryLimit: memoryLimit
                });

                // Handle Execution Result
                if (result.exitCode !== 0) {
                    // Check for TLE/MLE/RTE
                    let status = 'RUNTIME_ERROR';
                    let errorMsg = result.stderr;

                    if (result.stdout.includes('Time Limit Exceeded') || result.stderr.includes('Time Limit Exceeded') || result.timeout) {
                        status = 'TIME_LIMIT_EXCEEDED';
                        errorMsg = 'Time Limit Exceeded';
                    } else if (result.stderr.includes('Memory Limit Exceeded') || result.error === 'Memory Limit Exceeded') {
                        status = 'MEMORY_LIMIT_EXCEEDED';
                        errorMsg = 'Memory Limit Exceeded';
                    } else if (result.stderr.includes('Compilation') || result.stderr.includes('error:')) {
                        // Rough heuristic for compile error vs runtime
                        // Ideally IsolationManager distinguishes phase
                        // If exit code is non-zero and no execution time (compile fails fast or before run), it's CE.
                        // But we chain compile && run.
                        // If compile fails, `&&` prevents run.
                        // We can check if `compiled_binary` exists or checking stderr keywords.
                        if (result.stderr.includes('error:') || result.stderr.includes('Error:')) {
                            status = 'COMPILATION_ERROR';
                        }
                    }

                    // Fail this test case
                    testCaseResults.push({
                        testCaseId: i + 1,
                        passed: false,
                        expectedOutput: testCase.expectedOutput,
                        executionTime: result.time,
                        memoryUsed: result.memory,
                        error: errorMsg
                    });

                    // Specific verdict stops? LeetCode runs all usually, but for contest mode we might stop.
                    // We'll continue to collect stats.
                    continue;
                }

                // Validation
                const passed = Validator.validate(
                    result.stdout,
                    testCase.expectedOutput,
                    validationConfig.mode as any,
                    { epsilon: validationConfig.epsilon }
                );

                testCaseResults.push({
                    testCaseId: i + 1,
                    passed,
                    actualOutput: result.stdout, // In production, maybe truncate
                    expectedOutput: testCase.expectedOutput,
                    executionTime: result.time,
                    memoryUsed: result.memory
                });

                totalExecutionTime += result.time;
                maxMemoryUsed = Math.max(maxMemoryUsed, result.memory);

            } catch (err: any) {
                logger.error(`Test case ${i + 1} failed internally`, err);
                testCaseResults.push({
                    testCaseId: i + 1,
                    passed: false,
                    expectedOutput: testCase.expectedOutput,
                    executionTime: 0,
                    memoryUsed: 0,
                    error: 'Internal System Error'
                });
            }
        }

        return this.aggregateResults(testCaseResults);
    }

    private checkEntrypoint(language: string, code: string): boolean {
        if (language === 'cpp') return code.includes('int main');
        if (language === 'java') return code.includes('public static void main');
        if (language === 'python') return code.includes('if __name__');
        if (language === 'javascript') return code.includes('main()') && !code.includes('class Solution'); // Weak check
        return false;
    }

    private aggregateResults(testCaseResults: TestCaseResult[]): CodeExecutionResult {
        const passedCount = testCaseResults.filter((r) => r.passed).length;
        const totalCount = testCaseResults.length;

        let status: CodeExecutionResult['status'] = 'ACCEPTED';
        let errorMessage: string | undefined;

        // Priority: CE > RE > TLE > MLE > WA > AC
        if (testCaseResults.some(r => r.error && r.error.includes('Compilation'))) status = 'COMPILATION_ERROR';
        else if (testCaseResults.some(r => r.error && r.error.includes('Memory'))) status = 'MEMORY_LIMIT_EXCEEDED';
        else if (testCaseResults.some(r => r.error === 'Time Limit Exceeded')) status = 'TIME_LIMIT_EXCEEDED';
        else if (testCaseResults.some(r => r.error)) status = 'RUNTIME_ERROR';
        else if (passedCount < totalCount) status = 'WRONG_ANSWER';

        if (status !== 'ACCEPTED') {
            errorMessage = testCaseResults.find(r => r.error)?.error;
            // If WA, maybe show diff?
        }

        const totalExecutionTime = testCaseResults.reduce((acc, r) => acc + r.executionTime, 0);
        const maxMemoryUsed = testCaseResults.reduce((acc, r) => Math.max(acc, r.memoryUsed), 0);

        return {
            status,
            testCaseResults,
            passedCount,
            totalCount,
            executionTime: totalExecutionTime,
            memoryUsed: maxMemoryUsed,
            errorMessage
        };
    }

    // Legacy helper kept for API compatibility if needed
    public async addExecutionJob(submissionId: string, request: CodeExecutionRequest): Promise<void> {
        const queueService = QueueService.getInstance();
        await queueService.addExecutionJob({
            submissionId,
            ...request
        });
    }
}

export const codeExecutionService = new CodeExecutionService();

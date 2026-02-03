// Code execution service - supports all languages via backend API
// Falls back to client-side execution for JavaScript if backend is unavailable

interface TestCase {
    input: any[];
    expectedOutput: any;
}

interface ExecutionResult {
    status: 'ACCEPTED' | 'WRONG_ANSWER' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'COMPILATION_ERROR';
    runtime: string;
    memory: string;
    passed: number;
    total: number;
    output?: string;
    error?: string;
    logs?: string;
    testCases: Array<{
        input: string;
        expected: string;
        actual: string;
        passed: boolean;
    }>;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export class CodeExecutor {
    static async executeCode(
        code: string,
        language: string,
        problemSlug: string,
        authToken?: string
    ): Promise<ExecutionResult> {
        // Try backend API first for all languages
        try {
            const backendResult = await this.executeViaBackend(code, language, problemSlug, authToken);
            if (backendResult) return backendResult;
        } catch (error) {
            console.log('Backend unavailable, falling back to client-side execution for JavaScript');
        }

        // Fallback to client-side execution for JavaScript only
        if (language === 'javascript') {
            return this.executeClientSide(code, problemSlug);
        }

        // For other languages without backend, show error
        throw new Error(`${language} execution requires backend service. Please start the backend server.`);
    }

    private static async executeViaBackend(
        code: string,
        language: string,
        problemSlug: string,
        authToken?: string
    ): Promise<ExecutionResult | null> {
        try {
            const testCases = this.getTestCases(problemSlug);

            // Call backend API with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            // Add authorization header if token is provided
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(`${BACKEND_URL}/api/v1/submissions/run`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    code,
                    language: this.mapLanguage(language),
                    testCases: testCases.map(tc => ({
                        input: JSON.stringify(tc.input),
                        expectedOutput: JSON.stringify(tc.expectedOutput)
                    }))
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                // Silently return null to trigger fallback
                return null;
            }

            const data = await response.json();

            // Transform backend response to our format
            return this.transformBackendResponse(data, testCases);
        } catch (error) {
            // Silently catch all errors (network, timeout, etc.) and return null for fallback
            // Only log in development
            if (process.env.NODE_ENV === 'development') {
                console.log('Backend unavailable, using client-side execution');
            }
            return null;
        }
    }

    private static transformBackendResponse(backendData: any, testCases: TestCase[]): ExecutionResult {
        const results = backendData.results || [];
        const testCaseResults = results.map((result: any, index: number) => ({
            input: this.formatInput(testCases[index]?.input || []),
            expected: JSON.stringify(testCases[index]?.expectedOutput),
            actual: result.output || result.error || 'No output',
            passed: result.status === 'PASSED'
        }));

        const passedCount = testCaseResults.filter((r: any) => r.passed).length;
        const totalCount = testCaseResults.length;

        return {
            status: passedCount === totalCount ? 'ACCEPTED' :
                backendData.status === 'COMPILATION_ERROR' ? 'COMPILATION_ERROR' :
                    backendData.status === 'RUNTIME_ERROR' ? 'RUNTIME_ERROR' : 'WRONG_ANSWER',
            runtime: backendData.runtime || 'N/A',
            memory: backendData.memory || 'N/A',
            passed: passedCount,
            total: totalCount,
            output: passedCount === totalCount ? 'All test cases passed!' : undefined,
            error: backendData.error || (passedCount < totalCount ? `Failed ${totalCount - passedCount} test case(s)` : undefined),
            logs: backendData.logs || '',
            testCases: testCaseResults
        };
    }

    private static async executeClientSide(code: string, problemSlug: string): Promise<ExecutionResult> {
        // No artificial delay - execute immediately
        try {
            const testCases = this.getTestCases(problemSlug);

            // Execute all test cases in parallel for speed
            const results = await Promise.all(
                testCases.map(async (testCase) => {
                    try {
                        const actual = this.runJavaScriptTestCase(code, testCase.input);
                        const passed = this.compareOutputs(actual, testCase.expectedOutput);

                        return {
                            input: this.formatInput(testCase.input),
                            expected: JSON.stringify(testCase.expectedOutput),
                            actual: JSON.stringify(actual),
                            passed: passed
                        };
                    } catch (error: any) {
                        return {
                            input: this.formatInput(testCase.input),
                            expected: JSON.stringify(testCase.expectedOutput),
                            actual: `Error: ${error.message}`,
                            passed: false
                        };
                    }
                })
            );

            const passedCount = results.filter(r => r.passed).length;
            const totalCount = results.length;
            const allPassed = passedCount === totalCount;

            return {
                status: allPassed ? 'ACCEPTED' : 'WRONG_ANSWER',
                runtime: `${Math.floor(Math.random() * 30) + 5}ms`, // Faster simulated time
                memory: `${(Math.random() * 3 + 28).toFixed(1)}MB`,
                passed: passedCount,
                total: totalCount,
                output: allPassed ? 'All test cases passed!' : undefined,
                error: !allPassed ? `Failed ${totalCount - passedCount} test case(s)` : undefined,
                logs: allPassed ? 'Output matched expected result.' : 'Some test cases failed.',
                testCases: results
            };
        } catch (error: any) {
            return {
                status: 'RUNTIME_ERROR',
                runtime: 'N/A',
                memory: 'N/A',
                passed: 0,
                total: 3,
                error: error.message,
                logs: 'Runtime error occurred during execution',
                testCases: []
            };
        }
    }

    private static runJavaScriptTestCase(code: string, input: any[]): any {
        try {
            // Extract function name
            const functionNameMatch = code.match(/function\s+(\w+)/);
            if (!functionNameMatch) {
                throw new Error('No function declaration found. Please define a function.');
            }

            const functionName = functionNameMatch[1];

            // Create executable code
            const wrappedCode = `
                ${code}
                return ${functionName}(...arguments);
            `;

            const func = new Function(wrappedCode);
            return func(...input);
        } catch (error: any) {
            throw new Error(`Execution error: ${error.message}`);
        }
    }

    private static mapLanguage(language: string): string {
        const languageMap: Record<string, string> = {
            'javascript': 'javascript',
            'python': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c++': 'cpp'
        };
        return languageMap[language.toLowerCase()] || language;
    }

    private static formatInput(input: any[]): string {
        return input.map(i => JSON.stringify(i)).join(', ');
    }

    /**
     * Smart output comparison that handles various edge cases
     * Matches the backend implementation for consistency
     */
    private static compareOutputs(actual: any, expected: any): boolean {
        // Direct comparison
        if (actual === expected) {
            return true;
        }

        // Deep equality for objects and arrays
        if (typeof actual === 'object' && typeof expected === 'object') {
            return JSON.stringify(actual) === JSON.stringify(expected);
        }

        // String comparison with normalization
        const actualStr = String(actual).trim();
        const expectedStr = String(expected).trim();

        if (actualStr === expectedStr) {
            return true;
        }

        // Floating point comparison with tolerance
        if (typeof actual === 'number' && typeof expected === 'number') {
            return Math.abs(actual - expected) < 1e-6;
        }

        // Try parsing as numbers
        const actualNum = parseFloat(actualStr);
        const expectedNum = parseFloat(expectedStr);
        if (!isNaN(actualNum) && !isNaN(expectedNum)) {
            return Math.abs(actualNum - expectedNum) < 1e-6;
        }

        // Array comparison (handles different formats)
        try {
            const actualArray = JSON.parse(actualStr);
            const expectedArray = JSON.parse(expectedStr);
            if (Array.isArray(actualArray) && Array.isArray(expectedArray)) {
                return JSON.stringify(actualArray) === JSON.stringify(expectedArray);
            }
        } catch {
            // Not valid JSON
        }

        return false;
    }

    private static getTestCases(problemSlug: string): TestCase[] {
        const testCaseMap: Record<string, TestCase[]> = {
            'two-sum': [
                { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1] },
                { input: [[3, 2, 4], 6], expectedOutput: [1, 2] },
                { input: [[3, 3], 6], expectedOutput: [0, 1] }
            ],
            'add-two-numbers': [
                { input: [[2, 4, 3], [5, 6, 4]], expectedOutput: [7, 0, 8] },
                { input: [[0], [0]], expectedOutput: [0] },
                { input: [[9, 9, 9, 9, 9, 9, 9], [9, 9, 9, 9]], expectedOutput: [8, 9, 9, 9, 0, 0, 0, 1] }
            ],
            'longest-substring-without-repeating-characters': [
                { input: ['abcabcbb'], expectedOutput: 3 },
                { input: ['bbbbb'], expectedOutput: 1 },
                { input: ['pwwkew'], expectedOutput: 3 }
            ],
            'reverse-string': [
                { input: [['h', 'e', 'l', 'l', 'o']], expectedOutput: ['o', 'l', 'l', 'e', 'h'] },
                { input: [['H', 'a', 'n', 'n', 'a', 'h']], expectedOutput: ['h', 'a', 'n', 'n', 'a', 'H'] }
            ],
            'valid-parentheses': [
                { input: ['()'], expectedOutput: true },
                { input: ['()[]{}'], expectedOutput: true },
                { input: ['(]'], expectedOutput: false }
            ],
            'maximum-subarray': [
                { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expectedOutput: 6 },
                { input: [[1]], expectedOutput: 1 },
                { input: [[5, 4, -1, 7, 8]], expectedOutput: 23 }
            ],
            'merge-two-sorted-lists': [
                { input: [[1, 2, 4], [1, 3, 4]], expectedOutput: [1, 1, 2, 3, 4, 4] },
                { input: [[], []], expectedOutput: [] },
                { input: [[], [0]], expectedOutput: [0] }
            ],
            'best-time-to-buy-and-sell-stock': [
                { input: [[7, 1, 5, 3, 6, 4]], expectedOutput: 5 },
                { input: [[7, 6, 4, 3, 1]], expectedOutput: 0 }
            ],
            'contains-duplicate': [
                { input: [[1, 2, 3, 1]], expectedOutput: true },
                { input: [[1, 2, 3, 4]], expectedOutput: false },
                { input: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expectedOutput: true }
            ],
            'product-of-array-except-self': [
                { input: [[1, 2, 3, 4]], expectedOutput: [24, 12, 8, 6] },
                { input: [[-1, 1, 0, -3, 3]], expectedOutput: [0, 0, 9, 0, 0] }
            ],
            'default': [
                { input: ['test input 1'], expectedOutput: 'expected output 1' },
                { input: ['test input 2'], expectedOutput: 'expected output 2' },
                { input: ['test input 3'], expectedOutput: 'expected output 3' }
            ]
        };

        return testCaseMap[problemSlug] || testCaseMap['default'];
    }
}

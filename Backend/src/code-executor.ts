import express from 'express';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const app = express();
app.use(express.json({ limit: '10mb' }));

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://ce.judge0.com';

const LANGUAGE_IDS: Record<string, number> = {
    python: 71,
    javascript: 93,
    cpp: 54,
    java: 91
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
    const languageId = LANGUAGE_IDS[language];
    if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
    }

    let passedTests = 0;
    let totalTime = 0;
    let maxMemory = 0;

    for (const testCase of testCases) {
        try {
            const response = await axios.post(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
                source_code: code,
                language_id: languageId,
                stdin: testCase.input,
                expected_output: testCase.expected_output,
                cpu_time_limit: timeLimit / 1000,
                memory_limit: memoryLimit * 1024,
            });

            const data = response.data;
            const statusId = data.status.id;

            // Update stats
            if (data.time) totalTime += parseFloat(data.time) * 1000;
            if (data.memory) maxMemory = Math.max(maxMemory, data.memory / 1024);

            if (statusId === 3) {
                // Accepted
                passedTests++;
            } else if (statusId === 4) {
                // Wrong Answer
                return {
                    status: 'WRONG_ANSWER',
                    testCasesPassed: passedTests,
                    totalTestCases: testCases.length,
                    executionTime: totalTime,
                    memoryUsed: maxMemory,
                    errorMessage: `Expected: ${testCase.expected_output.trim()}\nGot: ${data.stdout ? data.stdout.trim() : ''}`
                };
            } else if (statusId === 5) {
                // Time Limit Exceeded
                return {
                    status: 'TIME_LIMIT_EXCEEDED',
                    testCasesPassed: passedTests,
                    totalTestCases: testCases.length,
                    executionTime: totalTime,
                    memoryUsed: maxMemory,
                    errorMessage: 'Time limit exceeded'
                };
            } else if (statusId === 6) {
                // Compilation Error
                return {
                    status: 'COMPILATION_ERROR',
                    testCasesPassed: 0,
                    totalTestCases: testCases.length,
                    executionTime: 0,
                    memoryUsed: 0,
                    errorMessage: data.compile_output
                };
            } else {
                // Runtime Error or others
                return {
                    status: 'RUNTIME_ERROR',
                    testCasesPassed: passedTests,
                    totalTestCases: testCases.length,
                    executionTime: totalTime,
                    memoryUsed: maxMemory,
                    errorMessage: data.stderr || data.message || 'Runtime Error'
                };
            }
        } catch (error: any) {
            console.error('Judge0 API error:', error.response?.data || error.message);
            throw new Error('Code execution service unavailable');
        }
    }

    return {
        status: 'ACCEPTED',
        testCasesPassed: passedTests,
        totalTestCases: testCases.length,
        executionTime: totalTime,
        memoryUsed: maxMemory
    };
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

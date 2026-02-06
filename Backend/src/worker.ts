import 'dotenv/config';
import { QueueService } from './services/queue.service';
import { codeExecutionService } from './services/codeExecution.service';
import { logger } from './config/logger';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase for status updates
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const startWorker = async () => {
    logger.info('Starting Code Execution Worker...');

    const queue = QueueService.getInstance().getQueue();

    queue.process(async (job) => {
        const { submissionId, code, language, testCases, timeLimit, memoryLimit } = job.data;
        logger.info(`Processing submission: ${submissionId}`);

        try {
            // Update status to PROCESSING
            await supabase
                .from('competition_submissions')
                .update({ status: 'PROCESSING' })
                .eq('id', submissionId);

            // Execute Code
            const result = await codeExecutionService.executeCode({
                code,
                language,
                testCases,
                timeLimit,
                memoryLimit
            });

            // Update Database with Result
            await supabase
                .from('competition_submissions')
                .update({
                    status: result.status,
                    test_cases_passed: result.passedCount,
                    total_test_cases: result.totalCount,
                    execution_time: result.executionTime,
                    memory_used: result.memoryUsed,
                    error_message: result.errorMessage,
                    evaluated_at: new Date().toISOString()
                })
                .eq('id', submissionId);

            // Trigger post-processing RPC
            await supabase.rpc('process_submission', {
                sub_id: submissionId,
                is_correct: result.status === 'ACCEPTED',
                exec_time: result.executionTime,
                test_passed: result.passedCount,
                test_total: result.totalCount
            });

            logger.info(`Submission ${submissionId} completed with status: ${result.status}`);
            return result;

        } catch (error: any) {
            logger.error(`Submission ${submissionId} failed:`, error);

            await supabase
                .from('competition_submissions')
                .update({
                    status: 'SYSTEM_ERROR',
                    error_message: error.message
                })
                .eq('id', submissionId);

            throw error;
        }
    });

    logger.info('Worker is ready and listening for jobs.');
};

startWorker().catch(err => {
    logger.error('Worker failed to start:', err);
    process.exit(1);
});

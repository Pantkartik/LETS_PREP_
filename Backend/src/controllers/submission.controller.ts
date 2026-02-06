import { Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { codeExecutionService } from '../services/codeExecution.service';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../config/logger';
import { AppError } from '../middleware/errorHandler';

export class SubmissionController {
    // Submit code for evaluation
    public submitCode = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const {
                problem_id,
                battle_id,
                code,
                language,
            } = req.body;

            // Get problem details
            const { data: problem, error: problemError } = await supabase
                .from('problems')
                .select('*')
                .eq('id', problem_id)
                .single();

            if (problemError || !problem) {
                return next(new AppError(404, 'Problem not found'));
            }

            // Create submission record
            const { data: submission, error: submissionError } = await supabase
                .from('submissions')
                .insert({
                    user_id: req.user!.id,
                    problem_id,
                    battle_id: battle_id || null,
                    code,
                    language,
                    status: 'PENDING',
                })
                .select()
                .single();

            if (submissionError) throw submissionError;

            // Return submission ID immediately
            res.status(202).json({
                submission_id: submission.id,
                status: 'PENDING',
                message: 'Code submitted for evaluation',
            });

            // Execute code asynchronously
            this.executeCodeAsync(submission.id, code, language, problem);

        } catch (error) {
            logger.error('Error submitting code', { error });
            next(new AppError(500, 'Failed to submit code'));
        }
    };

    // Execute code asynchronously
    private async executeCodeAsync(
        submissionId: string,
        code: string,
        language: string,
        problem: any
    ): Promise<void> {
        try {
            // Update status to RUNNING
            await supabase
                .from('submissions')
                .update({ status: 'RUNNING' })
                .eq('id', submissionId);

            const request = {
                code,
                language,
                testCases: problem.test_cases,
                timeLimit: problem.time_limit_ms,
                memoryLimit: problem.memory_limit_mb,
            };

            // Check if we should use Queue (Async Worker)
            if (process.env.ASYNC_EXECUTION === 'true') {
                logger.info(`Offloading submission ${submissionId} to execution queue`);
                await codeExecutionService.addExecutionJob(submissionId, request);
                // Return here - the worker will handle execution, scoring, and DB updates
                return;
            }

            // Synchronous Execution (Legacy/Dev)
            const result = await codeExecutionService.executeCode(request);

            // Calculate score
            const score = this.calculateScore(result.passedCount, result.totalCount, result.executionTime);

            // Update submission with results
            await supabase
                .from('submissions')
                .update({
                    status: result.status,
                    test_case_results: result.testCaseResults,
                    passed_count: result.passedCount,
                    total_count: result.totalCount,
                    execution_time_ms: result.executionTime,
                    memory_used_mb: result.memoryUsed,
                    error_message: result.errorMessage,
                    score,
                    evaluated_at: new Date().toISOString(),
                })
                .eq('id', submissionId);

            // If accepted, update user's best submission
            if (result.status === 'ACCEPTED') {
                await this.updateBestSubmission(submissionId);
            }

            logger.info('Code execution completed', {
                submissionId,
                status: result.status,
                passedCount: result.passedCount,
                totalCount: result.totalCount,
            });

        } catch (error) {
            logger.error('Error executing code', { error, submissionId });

            // Update submission with error
            await supabase
                .from('submissions')
                .update({
                    status: 'SYSTEM_ERROR',
                    error_message: 'Internal execution error',
                    evaluated_at: new Date().toISOString(),
                })
                .eq('id', submissionId);
        }
    }

    // Calculate score based on test cases passed and execution time
    private calculateScore(passedCount: number, totalCount: number, executionTime: number): number {
        const correctnessScore = (passedCount / totalCount) * 70;
        const timeScore = Math.max(0, 30 - (executionTime / 100)); // Faster = higher score
        return Math.round(correctnessScore + timeScore);
    }

    // Update best submission flag
    private async updateBestSubmission(submissionId: string): Promise<void> {
        try {
            const { data: submission } = await supabase
                .from('submissions')
                .select('user_id, problem_id, score')
                .eq('id', submissionId)
                .single();

            if (!submission) return;

            // Clear previous best submissions
            await supabase
                .from('submissions')
                .update({ is_best_submission: false })
                .eq('user_id', submission.user_id)
                .eq('problem_id', submission.problem_id);

            // Set current as best
            await supabase
                .from('submissions')
                .update({ is_best_submission: true })
                .eq('id', submissionId);

        } catch (error) {
            logger.error('Error updating best submission', { error });
        }
    }

    // Run code with custom input (no evaluation) or multiple test cases
    public runCode = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { code, language, input, testCases } = req.body;

            // Determine test cases to run
            let casesToRun = [];
            if (testCases && Array.isArray(testCases) && testCases.length > 0) {
                casesToRun = testCases.map((tc: any) => ({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput || '',
                    isHidden: false
                }));
            } else if (input) {
                casesToRun = [{
                    input,
                    expectedOutput: '',
                    isHidden: false
                }];
            } else {
                return next(new AppError(400, 'Either input or testCases must be provided'));
            }

            // Execute code
            const result = await codeExecutionService.executeCode({
                code,
                language,
                testCases: casesToRun,
                timeLimit: 5000,
                memoryLimit: 256,
            });

            // Format response to support both single input (old) and batch (new)
            // If it was a batch request (testCases provided), return full result structure
            if (testCases) {
                res.json({
                    results: result.testCaseResults.map(r => ({
                        output: r.actualOutput || r.error || '',
                        error: r.error, // Frontend executor expects error in 'actual' usually, but we can send it separately
                        status: r.passed ? 'PASSED' : 'FAILED'
                    })),
                    status: result.status,
                    runtime: result.executionTime,
                    memory: result.memoryUsed,
                    error: result.errorMessage,
                    logs: ''
                });
            } else {
                // Legacy response for single input
                res.json({
                    output: result.testCaseResults[0]?.actualOutput || '',
                    executionTime: result.executionTime,
                    memoryUsed: result.memoryUsed,
                    status: result.status,
                    error: result.errorMessage,
                });
            }

        } catch (error) {
            logger.error('Error running code', { error });
            next(new AppError(500, 'Failed to run code'));
        }
    };

    // Get submission by ID
    public getSubmission = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            const { data, error } = await supabase
                .from('submissions')
                .select(`
          *,
          user:profiles(id, username, avatar_url),
          problem:problems(id, title, slug, difficulty)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;

            if (!data) {
                return next(new AppError(404, 'Submission not found'));
            }

            // Only allow user to see their own submission or if they're a teacher
            if (data.user_id !== req.user!.id && req.user!.role !== 'TEACHER') {
                return next(new AppError(403, 'Not authorized to view this submission'));
            }

            res.json(data);

        } catch (error) {
            logger.error('Error fetching submission', { error });
            next(new AppError(500, 'Failed to fetch submission'));
        }
    };

    // Get user submissions
    public getUserSubmissions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 20, problem_id, status } = req.query;

            // Only allow user to see their own submissions or if they're a teacher
            if (userId !== req.user!.id && req.user!.role !== 'TEACHER') {
                return next(new AppError(403, 'Not authorized to view these submissions'));
            }

            let query = supabase
                .from('submissions')
                .select(`
          *,
          problem:problems(id, title, slug, difficulty)
        `, { count: 'exact' })
                .eq('user_id', userId);

            if (problem_id) {
                query = query.eq('problem_id', problem_id);
            }

            if (status) {
                query = query.eq('status', status);
            }

            const from = (Number(page) - 1) * Number(limit);
            const to = from + Number(limit) - 1;
            query = query.range(from, to).order('created_at', { ascending: false });

            const { data, error, count } = await query;

            if (error) throw error;

            res.json({
                submissions: data,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: count,
                    totalPages: Math.ceil((count || 0) / Number(limit)),
                },
            });

        } catch (error) {
            logger.error('Error fetching user submissions', { error });
            next(new AppError(500, 'Failed to fetch submissions'));
        }
    };

    // Get problem submissions
    public getProblemSubmissions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { problemId } = req.params;
            const { page = 1, limit = 20 } = req.query;

            let query = supabase
                .from('submissions')
                .select(`
          *,
          user:profiles(id, username, avatar_url)
        `, { count: 'exact' })
                .eq('problem_id', problemId)
                .eq('user_id', req.user!.id); // Only show user's own submissions

            const from = (Number(page) - 1) * Number(limit);
            const to = from + Number(limit) - 1;
            query = query.range(from, to).order('created_at', { ascending: false });

            const { data, error, count } = await query;

            if (error) throw error;

            res.json({
                submissions: data,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: count,
                    totalPages: Math.ceil((count || 0) / Number(limit)),
                },
            });

        } catch (error) {
            logger.error('Error fetching problem submissions', { error });
            next(new AppError(500, 'Failed to fetch submissions'));
        }
    };

    // Get battle submissions
    public getBattleSubmissions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { battleId } = req.params;

            const { data, error } = await supabase
                .from('submissions')
                .select(`
          *,
          user:profiles(id, username, avatar_url),
          problem:problems(id, title, slug, difficulty)
        `)
                .eq('battle_id', battleId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            res.json(data);

        } catch (error) {
            logger.error('Error fetching battle submissions', { error });
            next(new AppError(500, 'Failed to fetch submissions'));
        }
    };
}

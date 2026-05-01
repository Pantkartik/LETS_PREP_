import { supabase } from '../config/supabase';
import judgeService from './judge.service';
import logger from '../config/logger';

export class SubmissionService {
  public async submit(userId: string, problemId: string, battleId: string | null, code: string, language: string) {
    // 1. Create PENDING submission
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        user_id: userId,
        problem_id: problemId,
        battle_id: battleId,
        code,
        language,
        status: 'PENDING'
      })
      .select()
      .single();

    if (submissionError) throw submissionError;

    // 2. Start evaluation asynchronously
    this.evaluate(submission.id, problemId, code, language);

    return submission;
  }

  private async evaluate(submissionId: string, problemId: string, code: string, language: string) {
    try {
      // Update to RUNNING
      await supabase.from('submissions').update({ status: 'RUNNING' }).eq('id', submissionId);

      // Fetch problem test cases
      const { data: problem } = await supabase.from('problems').select('*').eq('id', problemId).single();
      if (!problem) throw new Error('Problem not found');

      const testCases = problem.test_cases || [];
      const results = [];
      let passedCount = 0;
      let totalExecutionTime = 0;
      let maxMemory = 0;
      let overallStatus = 'ACCEPTED';

      for (const tc of testCases) {
        const result = await judgeService.execute(code, language, tc.input);
        
        const passed = judgeService.compare(result.stdout || '', tc.expected_output);
        if (passed) passedCount++;
        else if (overallStatus === 'ACCEPTED') overallStatus = 'WRONG_ANSWER';

        // Check for errors
        if (result.status.id !== 3 && result.status.id !== 4) { // Not Accepted or WA
            overallStatus = this.mapJudgeStatus(result.status.id);
        }

        results.push({
          input: tc.input,
          expected: tc.expected_output,
          actual: result.stdout,
          passed,
          time: result.time,
          memory: result.memory,
          error: result.stderr || result.compile_output
        });

        totalExecutionTime += parseFloat(result.time || '0');
        maxMemory = Math.max(maxMemory, result.memory || 0);
      }

      const finalStatus = passedCount === testCases.length ? 'ACCEPTED' : overallStatus;

      // Update submission results
      await supabase.from('submissions').update({
        status: finalStatus,
        test_case_results: results,
        passed_count: passedCount,
        total_count: testCases.length,
        execution_time_ms: totalExecutionTime * 1000,
        memory_used_mb: maxMemory / 1024,
        evaluated_at: new Date().toISOString()
      }).eq('id', submissionId);

      logger.info(`Submission ${submissionId} evaluated: ${finalStatus}`);

    } catch (err) {
      logger.error(`Evaluation failed for submission ${submissionId}`, err);
      await supabase.from('submissions').update({
        status: 'SYSTEM_ERROR',
        error_message: 'Internal evaluation error'
      }).eq('id', submissionId);
    }
  }

  private mapJudgeStatus(id: number): string {
    const map: Record<number, string> = {
      3: 'ACCEPTED',
      4: 'WRONG_ANSWER',
      5: 'TIME_LIMIT_EXCEEDED',
      6: 'COMPILATION_ERROR',
      7: 'RUNTIME_ERROR',
      8: 'RUNTIME_ERROR',
      9: 'RUNTIME_ERROR',
      10: 'RUNTIME_ERROR',
      11: 'RUNTIME_ERROR',
      12: 'RUNTIME_ERROR',
      13: 'INTERNAL_ERROR',
      14: 'EXEC_FORMAT_ERROR'
    };
    return map[id] || 'RUNTIME_ERROR';
  }
}

export const submissionService = new SubmissionService();
export default submissionService;

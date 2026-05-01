import { Request, Response, NextFunction } from 'express';
import submissionService from '../services/submission.service';
import { AuthRequest } from '../middleware/auth';
import { supabase } from '../config/supabase';

export class SubmissionController {
  public submit = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { problem_id, battle_id, code, language } = req.body;
      const submission = await submissionService.submit(
        req.user!.id,
        problem_id,
        battle_id || null,
        code,
        language
      );
      
      res.status(202).json({
        status: 'success',
        data: {
          submission_id: submission.id,
          status: submission.status
        }
      });
    } catch (err) {
      next(err);
    }
  };

  public getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { data: submission, error } = await supabase
        .from('submissions')
        .select('*, problem:problems(title, difficulty)')
        .eq('id', req.params.id)
        .single();

      if (error || !submission) {
        return res.status(404).json({ status: 'fail', message: 'Submission not found' });
      }

      // Authorization check
      if (submission.user_id !== req.user?.id && req.user?.role !== 'TEACHER') {
        return res.status(403).json({ status: 'fail', message: 'Unauthorized' });
      }

      res.status(200).json({ status: 'success', data: { submission } });
    } catch (err) {
      next(err);
    }
  };

  public getUserSubmissions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*, problem:problems(title, difficulty)')
        .eq('user_id', req.user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.status(200).json({ status: 'success', data: { submissions } });
    } catch (err) {
      next(err);
    }
  };
}

export const submissionController = new SubmissionController();
export default submissionController;

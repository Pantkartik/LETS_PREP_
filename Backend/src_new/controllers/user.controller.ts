import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export class UserController {
  public getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', req.user!.id)
        .single();

      if (error) throw error;
      res.status(200).json({ status: 'success', data: { profile } });
    } catch (err) {
      next(err);
    }
  };

  public updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .update(req.body)
        .eq('id', req.user!.id)
        .select()
        .single();

      if (error) throw error;
      res.status(200).json({ status: 'success', data: { profile } });
    } catch (err) {
      next(err);
    }
  };
}

export const userController = new UserController();
export default userController;

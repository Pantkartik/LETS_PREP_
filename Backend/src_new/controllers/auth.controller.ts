import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import logger from '../config/logger';

export class AuthController {
  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, username, full_name, role } = req.body;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Create profile in public.profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user!.id,
          email,
          username,
          full_name,
          role: role || 'STUDENT',
        });

      if (profileError) throw profileError;

      res.status(201).json({
        status: 'success',
        data: { user: authData.user, session: authData.session }
      });
    } catch (err) {
      next(err);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      res.status(200).json({
        status: 'success',
        data: { user: data.user, session: data.session }
      });
    } catch (err) {
      next(err);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await supabase.auth.signOut();
      res.status(200).json({ status: 'success', message: 'Logged out' });
    } catch (err) {
      next(err);
    }
  };
}

export const authController = new AuthController();
export default authController;

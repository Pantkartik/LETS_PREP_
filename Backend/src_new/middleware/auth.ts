import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import logger from '../config/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    username?: string;
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1) Get token and check if it exists
    let token: string | undefined;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.',
      });
    }

    // 2) Verify token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      // Dev bypass / Clock skew fallback logic if needed
      if (process.env.NODE_ENV === 'development') {
        try {
          const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          if (payload.sub) {
             logger.warn(`Auth validation failed, but bypassing in development for user: ${payload.sub}`);
             const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', payload.sub)
                .single();
             
             if (profile) {
                req.user = {
                  id: profile.id,
                  email: profile.email,
                  role: profile.role,
                  username: profile.username
                };
                return next();
             }
          }
        } catch (e) {
          logger.error('Dev auth bypass failed', e);
        }
      }

      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token or session expired',
      });
    }

    // 3) Check if user still exists and get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // 4) Grant access to protected route
    req.user = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      username: profile.username
    };
    
    next();
  } catch (err) {
    logger.error('Auth middleware error', err);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during authentication',
    });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../config/logger';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
    public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, password, username, full_name, role } = req.body;

            // Register with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;

            // Create profile
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

            logger.info('User registered', { userId: authData.user!.id, email });

            res.status(201).json({
                user: authData.user,
                session: authData.session,
            });
        } catch (error) {
            logger.error('Registration error', { error });
            next(new AppError(500, 'Registration failed'));
        }
    };

    public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, password } = req.body;

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            logger.info('User logged in', { userId: data.user.id, email });

            res.json({
                user: data.user,
                session: data.session,
            });
        } catch (error) {
            logger.error('Login error', { error });
            next(new AppError(401, 'Invalid credentials'));
        }
    };

    public logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            await supabase.auth.signOut();
            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            logger.error('Logout error', { error });
            next(new AppError(500, 'Logout failed'));
        }
    };

    public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { refresh_token } = req.body;

            const { data, error } = await supabase.auth.refreshSession({
                refresh_token,
            });

            if (error) throw error;

            res.json({
                session: data.session,
            });
        } catch (error) {
            logger.error('Token refresh error', { error });
            next(new AppError(401, 'Invalid refresh token'));
        }
    };

    public getSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return next(new AppError(401, 'No token provided'));
            }

            const token = authHeader.substring(7);
            const { data, error } = await supabase.auth.getUser(token);

            if (error) throw error;

            res.json({ user: data.user });
        } catch (error) {
            next(new AppError(401, 'Invalid session'));
        }
    };

    public oauthCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // TODO: Implement OAuth callback
        res.status(501).json({ message: 'OAuth not implemented yet' });
    };
}

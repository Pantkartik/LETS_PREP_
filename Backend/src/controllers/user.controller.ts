import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../config/logger';
import { AppError } from '../middleware/errorHandler';

export class UserController {
    public getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', req.user!.id)
                .single();

            if (error) throw error;
            res.json(data);
        } catch (error) {
            next(new AppError(500, 'Failed to fetch profile'));
        }
    };

    public updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(req.body)
                .eq('id', req.user!.id)
                .select()
                .single();

            if (error) throw error;
            res.json(data);
        } catch (error) {
            next(new AppError(500, 'Failed to update profile'));
        }
    };

    public getUserStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('total_battles, total_wins, total_losses, current_streak, xp, level')
                .eq('id', req.user!.id)
                .single();

            const { count: problemsSolved } = await supabase
                .from('submissions')
                .select('problem_id', { count: 'exact', head: true })
                .eq('user_id', req.user!.id)
                .eq('status', 'ACCEPTED');

            res.json({
                ...profile,
                problemsSolved,
            });
        } catch (error) {
            next(new AppError(500, 'Failed to fetch user stats'));
        }
    };

    public getBattleHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { data, error } = await supabase
                .from('battle_participants')
                .select('*, battle:battles(*)')
                .eq('user_id', req.user!.id)
                .order('joined_at', { ascending: false });

            if (error) throw error;
            res.json(data);
        } catch (error) {
            next(new AppError(500, 'Failed to fetch battle history'));
        }
    };

    public getSubmissions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { data, error } = await supabase
                .from('submissions')
                .select('*, problem:problems(title, slug)')
                .eq('user_id', req.user!.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            res.json(data);
        } catch (error) {
            next(new AppError(500, 'Failed to fetch submissions'));
        }
    };

    public getAchievements = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { data, error } = await supabase
                .from('user_achievements')
                .select('*, achievement:achievements(*)')
                .eq('user_id', req.user!.id);

            if (error) throw error;
            res.json(data);
        } catch (error) {
            next(new AppError(500, 'Failed to fetch achievements'));
        }
    };

    public getActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { data, error } = await supabase
                .from('activity_logs')
                .select('*')
                .eq('user_id', req.user!.id)
                .order('created_at', { ascending: false })
                .limit(365);

            if (error) throw error;
            res.json(data);
        } catch (error) {
            next(new AppError(500, 'Failed to fetch activity'));
        }
    };

    public getGlobalLeaderboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, avatar_url, xp, level, total_wins')
                .eq('role', 'STUDENT')
                .order('xp', { ascending: false })
                .limit(100);

            if (error) throw error;
            res.json(data);
        } catch (error) {
            next(new AppError(500, 'Failed to fetch leaderboard'));
        }
    };

    public getUserById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) return next(new AppError(404, 'User not found'));
            res.json(data);
        } catch (error) {
            next(new AppError(500, 'Failed to fetch user'));
        }
    };

    public getPublicProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, avatar_url, bio, xp, level, total_battles, total_wins, github_username, linkedin_url')
                .eq('id', id)
                .single();

            if (error || !data) return next(new AppError(404, 'User not found'));
            res.json(data);
        } catch (error) {
            next(new AppError(500, 'Failed to fetch public profile'));
        }
    };
}

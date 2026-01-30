import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../config/logger';
import { AppError } from '../middleware/errorHandler';

export class ProblemController {
    public getProblems = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { difficulty, category, page = 1, limit = 20 } = req.query;

            let query = supabase
                .from('problems')
                .select('*', { count: 'exact' })
                .eq('approved', true);

            if (difficulty) query = query.eq('difficulty', difficulty);
            if (category) query = query.eq('category', category);

            const from = (Number(page) - 1) * Number(limit);
            query = query.range(from, from + Number(limit) - 1);

            const { data, error, count } = await query;
            if (error) throw error;

            res.json({
                problems: data,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: count,
                    totalPages: Math.ceil((count || 0) / Number(limit)),
                },
            });
        } catch (error) {
            next(new AppError(500, 'Failed to fetch problems'));
        }
    };

    public getProblem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { data, error } = await supabase
                .from('problems')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) return next(new AppError(404, 'Problem not found'));
            res.json(data);
        } catch (error) {
            next(new AppError(500, 'Failed to fetch problem'));
        }
    };

    public getProblemBySlug = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { slug } = req.params;
            const { data, error } = await supabase
                .from('problems')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error || !data) return next(new AppError(404, 'Problem not found'));
            res.json(data);
        } catch (error) {
            next(new AppError(500, 'Failed to fetch problem'));
        }
    };

    public createProblem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const problemData = { ...req.body, created_by: req.user!.id };
            const { data, error } = await supabase
                .from('problems')
                .insert(problemData)
                .select()
                .single();

            if (error) throw error;
            res.status(201).json(data);
        } catch (error) {
            next(new AppError(500, 'Failed to create problem'));
        }
    };

    public updateProblem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { data, error } = await supabase
                .from('problems')
                .update(req.body)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            res.json(data);
        } catch (error) {
            next(new AppError(500, 'Failed to update problem'));
        }
    };

    public deleteProblem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { error } = await supabase
                .from('problems')
                .delete()
                .eq('id', id);

            if (error) throw error;
            res.json({ message: 'Problem deleted successfully' });
        } catch (error) {
            next(new AppError(500, 'Failed to delete problem'));
        }
    };

    public getProblemStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { data, error } = await supabase
                .from('problems')
                .select('total_submissions, total_accepted, acceptance_rate')
                .eq('id', id)
                .single();

            if (error) throw error;
            res.json(data);
        } catch (error) {
            next(new AppError(500, 'Failed to fetch problem stats'));
        }
    };

    public getRandomProblem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { difficulty } = req.query;

            let query = supabase
                .from('problems')
                .select('*')
                .eq('approved', true);

            if (difficulty) query = query.eq('difficulty', difficulty);

            const { data, error } = await query;
            if (error || !data || data.length === 0) {
                return next(new AppError(404, 'No problems found'));
            }

            const randomProblem = data[Math.floor(Math.random() * data.length)];
            res.json(randomProblem);
        } catch (error) {
            next(new AppError(500, 'Failed to fetch random problem'));
        }
    };
}

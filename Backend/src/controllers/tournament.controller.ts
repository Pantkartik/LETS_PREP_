import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../config/logger';
import { AppError } from '../middleware/errorHandler';

export class TournamentController {
    public getTournaments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { status, page = 1, limit = 20 } = req.query;

            let query = supabase
                .from('tournaments')
                .select('*', { count: 'exact' });

            if (status) query = query.eq('status', status);

            const from = (Number(page) - 1) * Number(limit);
            query = query.range(from, from + Number(limit) - 1);

            const { data, error, count } = await query;
            if (error) throw error;

            res.json({
                tournaments: data,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: count,
                    totalPages: Math.ceil((count || 0) / Number(limit)),
                },
            });
        } catch (error) {
            next(new AppError(500, 'Failed to fetch tournaments'));
        }
    };

    public getTournament = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { data, error } = await supabase
                .from('tournaments')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) return next(new AppError(404, 'Tournament not found'));
            res.json(data);
        } catch (error) {
            next(new AppError(500, 'Failed to fetch tournament'));
        }
    };

    public createTournament = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tournamentData = { ...req.body, created_by: req.user!.id };
            const { data, error } = await supabase
                .from('tournaments')
                .insert(tournamentData)
                .select()
                .single();

            if (error) throw error;
            res.status(201).json(data);
        } catch (error) {
            next(new AppError(500, 'Failed to create tournament'));
        }
    };

    public updateTournament = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { data, error } = await supabase
                .from('tournaments')
                .update(req.body)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            res.json(data);
        } catch (error) {
            next(new AppError(500, 'Failed to update tournament'));
        }
    };

    public deleteTournament = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { error } = await supabase
                .from('tournaments')
                .delete()
                .eq('id', id);

            if (error) throw error;
            res.json({ message: 'Tournament deleted successfully' });
        } catch (error) {
            next(new AppError(500, 'Failed to delete tournament'));
        }
    };

    public registerForTournament = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            const { data, error } = await supabase
                .from('tournament_participants')
                .insert({
                    tournament_id: id,
                    user_id: req.user!.id,
                })
                .select()
                .single();

            if (error) throw error;
            res.status(201).json(data);
        } catch (error) {
            next(new AppError(500, 'Failed to register for tournament'));
        }
    };

    public getLeaderboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { data, error } = await supabase
                .from('tournament_participants')
                .select('*, user:profiles(username, avatar_url)')
                .eq('tournament_id', id)
                .order('total_score', { ascending: false });

            if (error) throw error;
            res.json(data);
        } catch (error) {
            next(new AppError(500, 'Failed to fetch leaderboard'));
        }
    };

    public getParticipants = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { data, error } = await supabase
                .from('tournament_participants')
                .select('*, user:profiles(username, avatar_url)')
                .eq('tournament_id', id);

            if (error) throw error;
            res.json(data);
        } catch (error) {
            next(new AppError(500, 'Failed to fetch participants'));
        }
    };
}

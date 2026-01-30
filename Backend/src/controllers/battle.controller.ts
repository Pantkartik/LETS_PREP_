import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { RedisService } from '../services/redis.service';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../config/logger';
import { AppError } from '../middleware/errorHandler';

export class BattleController {
    private redis = RedisService.getInstance();

    // Generate unique room code
    private generateRoomCode(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // Get all battles with filters
    public getBattles = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const {
                status,
                battle_type,
                difficulty,
                page = 1,
                limit = 20
            } = req.query;

            let query = supabase
                .from('battles')
                .select('*, created_by:profiles!battles_created_by_fkey(id, username, avatar_url)', { count: 'exact' });

            // Apply filters
            if (status) {
                query = query.eq('status', status);
            }
            if (battle_type) {
                query = query.eq('battle_type', battle_type);
            }
            if (difficulty) {
                query = query.eq('difficulty', difficulty);
            }

            // Pagination
            const from = (Number(page) - 1) * Number(limit);
            const to = from + Number(limit) - 1;
            query = query.range(from, to);

            // Order by created_at
            query = query.order('created_at', { ascending: false });

            const { data, error, count } = await query;

            if (error) throw error;

            res.json({
                battles: data,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: count,
                    totalPages: Math.ceil((count || 0) / Number(limit)),
                },
            });
        } catch (error) {
            logger.error('Error fetching battles', { error });
            next(new AppError(500, 'Failed to fetch battles'));
        }
    };

    // Get single battle
    public getBattle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            const { data, error } = await supabase
                .from('battles')
                .select(`
          *,
          created_by:profiles!battles_created_by_fkey(id, username, avatar_url),
          problem:problems(id, title, slug, difficulty, category),
          participants:battle_participants(
            *,
            user:profiles(id, username, avatar_url)
          )
        `)
                .eq('id', id)
                .single();

            if (error) throw error;

            if (!data) {
                return next(new AppError(404, 'Battle not found'));
            }

            res.json(data);
        } catch (error) {
            logger.error('Error fetching battle', { error });
            next(new AppError(500, 'Failed to fetch battle'));
        }
    };

    // Create battle
    public createBattle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const {
                title,
                description,
                battle_type,
                difficulty,
                categories,
                max_players,
                time_limit_minutes,
                scheduled_start_time,
                problem_id,
            } = req.body;

            // Generate unique room code
            let roomCode = this.generateRoomCode();
            let isUnique = false;

            while (!isUnique) {
                const { data } = await supabase
                    .from('battles')
                    .select('id')
                    .eq('room_code', roomCode)
                    .single();

                if (!data) {
                    isUnique = true;
                } else {
                    roomCode = this.generateRoomCode();
                }
            }

            const { data, error } = await supabase
                .from('battles')
                .insert({
                    title,
                    description,
                    room_code: roomCode,
                    battle_type,
                    difficulty,
                    categories,
                    max_players: max_players || 8,
                    time_limit_minutes: time_limit_minutes || 30,
                    scheduled_start_time,
                    problem_id,
                    created_by: req.user!.id,
                    status: 'WAITING',
                })
                .select()
                .single();

            if (error) throw error;

            // Auto-join creator
            await supabase
                .from('battle_participants')
                .insert({
                    battle_id: data.id,
                    user_id: req.user!.id,
                    status: 'JOINED',
                });

            logger.info('Battle created', { battleId: data.id, userId: req.user!.id });

            res.status(201).json(data);
        } catch (error) {
            logger.error('Error creating battle', { error });
            next(new AppError(500, 'Failed to create battle'));
        }
    };

    // Update battle
    public updateBattle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const updates = req.body;

            // Check if user is creator
            const { data: battle } = await supabase
                .from('battles')
                .select('created_by')
                .eq('id', id)
                .single();

            if (!battle) {
                return next(new AppError(404, 'Battle not found'));
            }

            if (battle.created_by !== req.user!.id && req.user!.role !== 'ADMIN') {
                return next(new AppError(403, 'Not authorized to update this battle'));
            }

            const { data, error } = await supabase
                .from('battles')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            res.json(data);
        } catch (error) {
            logger.error('Error updating battle', { error });
            next(new AppError(500, 'Failed to update battle'));
        }
    };

    // Delete battle
    public deleteBattle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            // Check if user is creator
            const { data: battle } = await supabase
                .from('battles')
                .select('created_by')
                .eq('id', id)
                .single();

            if (!battle) {
                return next(new AppError(404, 'Battle not found'));
            }

            if (battle.created_by !== req.user!.id && req.user!.role !== 'ADMIN') {
                return next(new AppError(403, 'Not authorized to delete this battle'));
            }

            const { error } = await supabase
                .from('battles')
                .delete()
                .eq('id', id);

            if (error) throw error;

            res.json({ message: 'Battle deleted successfully' });
        } catch (error) {
            logger.error('Error deleting battle', { error });
            next(new AppError(500, 'Failed to delete battle'));
        }
    };

    // Join battle
    public joinBattle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            // Get battle info
            const { data: battle, error: battleError } = await supabase
                .from('battles')
                .select('*, participants:battle_participants(count)')
                .eq('id', id)
                .single();

            if (battleError) throw battleError;

            if (!battle) {
                return next(new AppError(404, 'Battle not found'));
            }

            // Check if battle is full
            if (battle.current_players >= battle.max_players) {
                return next(new AppError(400, 'Battle is full'));
            }

            // Check if already joined
            const { data: existing } = await supabase
                .from('battle_participants')
                .select('id')
                .eq('battle_id', id)
                .eq('user_id', req.user!.id)
                .single();

            if (existing) {
                return next(new AppError(400, 'Already joined this battle'));
            }

            // Join battle
            const { data, error } = await supabase
                .from('battle_participants')
                .insert({
                    battle_id: id,
                    user_id: req.user!.id,
                    status: 'JOINED',
                })
                .select()
                .single();

            if (error) throw error;

            logger.info('User joined battle', { battleId: id, userId: req.user!.id });

            res.json(data);
        } catch (error) {
            logger.error('Error joining battle', { error });
            next(new AppError(500, 'Failed to join battle'));
        }
    };

    // Leave battle
    public leaveBattle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            const { error } = await supabase
                .from('battle_participants')
                .delete()
                .eq('battle_id', id)
                .eq('user_id', req.user!.id);

            if (error) throw error;

            logger.info('User left battle', { battleId: id, userId: req.user!.id });

            res.json({ message: 'Left battle successfully' });
        } catch (error) {
            logger.error('Error leaving battle', { error });
            next(new AppError(500, 'Failed to leave battle'));
        }
    };

    // Start battle
    public startBattle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            // Check if user is creator
            const { data: battle } = await supabase
                .from('battles')
                .select('created_by, status')
                .eq('id', id)
                .single();

            if (!battle) {
                return next(new AppError(404, 'Battle not found'));
            }

            if (battle.created_by !== req.user!.id) {
                return next(new AppError(403, 'Only the creator can start the battle'));
            }

            if (battle.status !== 'WAITING') {
                return next(new AppError(400, 'Battle already started or completed'));
            }

            const { data, error } = await supabase
                .from('battles')
                .update({
                    status: 'ACTIVE',
                    actual_start_time: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            logger.info('Battle started', { battleId: id, userId: req.user!.id });

            res.json(data);
        } catch (error) {
            logger.error('Error starting battle', { error });
            next(new AppError(500, 'Failed to start battle'));
        }
    };

    // End battle
    public endBattle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            // Check if user is creator
            const { data: battle } = await supabase
                .from('battles')
                .select('created_by')
                .eq('id', id)
                .single();

            if (!battle) {
                return next(new AppError(404, 'Battle not found'));
            }

            if (battle.created_by !== req.user!.id) {
                return next(new AppError(403, 'Only the creator can end the battle'));
            }

            const { data, error } = await supabase
                .from('battles')
                .update({
                    status: 'COMPLETED',
                    end_time: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            logger.info('Battle ended', { battleId: id, userId: req.user!.id });

            res.json(data);
        } catch (error) {
            logger.error('Error ending battle', { error });
            next(new AppError(500, 'Failed to end battle'));
        }
    };

    // Get leaderboard
    public getLeaderboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            const { data, error } = await supabase
                .from('battle_participants')
                .select(`
          *,
          user:profiles(id, username, avatar_url)
        `)
                .eq('battle_id', id)
                .order('score', { ascending: false })
                .order('submission_time', { ascending: true });

            if (error) throw error;

            res.json(data);
        } catch (error) {
            logger.error('Error fetching leaderboard', { error });
            next(new AppError(500, 'Failed to fetch leaderboard'));
        }
    };

    // Get participants
    public getParticipants = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            const { data, error } = await supabase
                .from('battle_participants')
                .select(`
          *,
          user:profiles(id, username, avatar_url)
        `)
                .eq('battle_id', id);

            if (error) throw error;

            res.json(data);
        } catch (error) {
            logger.error('Error fetching participants', { error });
            next(new AppError(500, 'Failed to fetch participants'));
        }
    };

    // Get chat messages
    public getChatMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { limit = 50 } = req.query;

            const { data, error } = await supabase
                .from('chat_messages')
                .select(`
          *,
          user:profiles(id, username, avatar_url)
        `)
                .eq('battle_id', id)
                .order('created_at', { ascending: false })
                .limit(Number(limit));

            if (error) throw error;

            res.json(data.reverse());
        } catch (error) {
            logger.error('Error fetching chat messages', { error });
            next(new AppError(500, 'Failed to fetch chat messages'));
        }
    };

    // Join by room code
    public joinByRoomCode = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { room_code } = req.body;

            const { data: battle, error: battleError } = await supabase
                .from('battles')
                .select('id')
                .eq('room_code', room_code.toUpperCase())
                .single();

            if (battleError || !battle) {
                return next(new AppError(404, 'Battle not found with this room code'));
            }

            // Use existing join logic
            req.params.id = battle.id;
            await this.joinBattle(req, res, next);
        } catch (error) {
            logger.error('Error joining by room code', { error });
            next(new AppError(500, 'Failed to join battle'));
        }
    };
}

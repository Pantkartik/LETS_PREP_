import { z } from 'zod';

export const createBattleSchema = z.object({
    body: z.object({
        title: z.string().min(3).max(100),
        description: z.string().optional(),
        battle_type: z.enum(['PUBLIC', 'PRIVATE', 'PRACTICE']),
        difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
        categories: z.array(z.string()).optional(),
        max_players: z.number().min(2).max(8).optional(),
        time_limit_minutes: z.number().min(5).max(180).optional(),
        scheduled_start_time: z.string().datetime().optional(),
        problem_id: z.string().uuid().optional(),
    }),
});

export const updateBattleSchema = z.object({
    body: z.object({
        title: z.string().min(3).max(100).optional(),
        description: z.string().optional(),
        status: z.enum(['WAITING', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
        scheduled_start_time: z.string().datetime().optional(),
    }),
});

export const joinBattleSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

import { z } from 'zod';

export const createTournamentSchema = z.object({
    body: z.object({
        title: z.string().min(3).max(100),
        description: z.string().optional(),
        tournament_type: z.enum(['SINGLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS']),
        registration_start: z.string().datetime(),
        registration_end: z.string().datetime(),
        start_time: z.string().datetime(),
        end_time: z.string().datetime(),
        max_participants: z.number().min(4).max(128).optional(),
    }),
});

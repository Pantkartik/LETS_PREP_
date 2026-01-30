import { z } from 'zod';

export const submitCodeSchema = z.object({
    body: z.object({
        problem_id: z.string().uuid(),
        battle_id: z.string().uuid().optional(),
        code: z.string().min(1),
        language: z.enum(['python', 'java', 'cpp', 'javascript', 'go', 'rust']),
    }),
});

export const runCodeSchema = z.object({
    body: z.object({
        code: z.string().min(1),
        language: z.enum(['python', 'java', 'cpp', 'javascript', 'go', 'rust']),
        input: z.string(),
    }),
});

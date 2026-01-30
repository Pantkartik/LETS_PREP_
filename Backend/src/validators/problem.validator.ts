import { z } from 'zod';

export const createProblemSchema = z.object({
    body: z.object({
        title: z.string().min(3).max(200),
        slug: z.string().min(3).max(100),
        description: z.string().min(10),
        difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
        category: z.string(),
        tags: z.array(z.string()).optional(),
        sample_input: z.string().optional(),
        sample_output: z.string().optional(),
        test_cases: z.array(z.object({
            input: z.string(),
            expected_output: z.string(),
            is_hidden: z.boolean().optional(),
        })),
        starter_code: z.record(z.string()).optional(),
        time_limit_ms: z.number().min(100).max(10000).optional(),
        memory_limit_mb: z.number().min(16).max(512).optional(),
        points: z.number().min(1).max(100).optional(),
    }),
});

export const updateProblemSchema = z.object({
    body: z.object({
        title: z.string().min(3).max(200).optional(),
        description: z.string().min(10).optional(),
        difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
        approved: z.boolean().optional(),
    }),
});

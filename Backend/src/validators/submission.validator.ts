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
        input: z.string().optional(),
        testCases: z.array(z.object({
            input: z.string(),
            expectedOutput: z.string()
        })).optional()
    }).refine(data => data.input || data.testCases, {
        message: "Either input or testCases must be provided"
    }),
});

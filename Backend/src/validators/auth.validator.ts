import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(8),
        username: z.string().min(3).max(30),
        full_name: z.string().optional(),
        role: z.enum(['STUDENT', 'TEACHER']).default('STUDENT'),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string(),
    }),
});

export const refreshTokenSchema = z.object({
    body: z.object({
        refresh_token: z.string(),
    }),
});

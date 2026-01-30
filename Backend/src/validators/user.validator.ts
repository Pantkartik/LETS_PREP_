import { z } from 'zod';

export const updateProfileSchema = z.object({
    body: z.object({
        username: z.string().min(3).max(30).optional(),
        full_name: z.string().optional(),
        bio: z.string().max(500).optional(),
        avatar_url: z.string().url().optional(),
        github_username: z.string().optional(),
        linkedin_url: z.string().url().optional(),
        preferred_language: z.string().optional(),
    }),
});

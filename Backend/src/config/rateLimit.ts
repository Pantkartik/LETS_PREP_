import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const rateLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 'Check the Retry-After header for when you can try again.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            error: 'Too many requests',
            message: 'You have exceeded the rate limit. Please try again later.',
            retryAfter: res.getHeader('Retry-After'),
        });
    },
});

// Stricter rate limit for authentication endpoints
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        error: 'Too many authentication attempts, please try again later.',
    },
    skipSuccessfulRequests: true,
});

// Rate limit for code submissions
export const submissionRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 submissions per minute
    message: {
        error: 'Too many submissions, please slow down.',
    },
});

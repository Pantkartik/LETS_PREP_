import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../config/logger';

export const validateRequest = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                logger.warn('Validation error', { errors: error.errors });
                res.status(400).json({
                    error: 'Validation Error',
                    message: 'Invalid request data',
                    details: error.errors.map((err) => ({
                        path: err.path.join('.'),
                        message: err.message,
                    })),
                });
                return;
            }
            next(error);
        }
    };
};

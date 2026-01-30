import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (err instanceof AppError) {
        logger.error('Operational error', {
            statusCode: err.statusCode,
            message: err.message,
            path: req.path,
            method: req.method,
        });

        res.status(err.statusCode).json({
            error: err.message,
            statusCode: err.statusCode,
        });
        return;
    }

    // Programming or unknown errors
    logger.error('Unexpected error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
};

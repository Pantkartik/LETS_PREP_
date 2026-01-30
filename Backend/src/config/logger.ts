import winston from 'winston';
import path from 'path';

const logDir = process.env.LOG_FILE_PATH || './logs';
const logLevel = process.env.LOG_LEVEL || 'info';

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
    })
);

// Create logger
export const logger = winston.createLogger({
    level: logLevel,
    format: logFormat,
    defaultMeta: { service: 'ets-prep-backend' },
    transports: [
        // Write all logs to console
        new winston.transports.Console({
            format: process.env.NODE_ENV === 'development' ? consoleFormat : logFormat,
        }),

        // Write all logs with level 'error' and below to error.log
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),

        // Write all logs to combined.log
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'exceptions.log'),
        }),
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'rejections.log'),
        }),
    ],
});

// Create a stream object for Morgan
export const morganStream = {
    write: (message: string) => {
        logger.info(message.trim());
    },
};

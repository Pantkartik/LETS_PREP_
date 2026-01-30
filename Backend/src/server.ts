import 'dotenv/config'; // Must be the first import
import express, { Application } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

// Import configurations
// Import configurations
import { corsConfig } from './config/cors';
import { rateLimiter } from './config/rateLimit';
import { logger } from './config/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import battleRoutes from './routes/battle.routes';
import problemRoutes from './routes/problem.routes';
import submissionRoutes from './routes/submission.routes';
import userRoutes from './routes/user.routes';
import tournamentRoutes from './routes/tournament.routes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { authMiddleware } from './middleware/auth';

// Import WebSocket handlers
import { initializeSocketIO } from './sockets';

console.log('DEBUG: Env loaded. REDIS_MOCK=', process.env.REDIS_MOCK);

// Import services
import { RedisService } from './services/redis.service';

class Server {
    private app: Application;
    private httpServer;
    private io: SocketIOServer;
    private port: number;

    constructor() {
        console.log('DEBUG: Server constructor start');
        this.app = express();
        this.httpServer = createServer(this.app);
        this.io = new SocketIOServer(this.httpServer, {
            cors: corsConfig,
            pingInterval: parseInt(process.env.WS_PING_INTERVAL || '25000'),
            pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '60000'),
        });
        this.port = parseInt(process.env.PORT || '3001');

        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeWebSocket();
        this.initializeErrorHandling();
    }

    private initializeMiddleware(): void {
        console.log('DEBUG: initializeMiddleware start');
        // Security middleware
        this.app.use(helmet());

        // CORS
        this.app.use(cors(corsConfig));

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Cookie parsing
        this.app.use(cookieParser());

        // Compression
        this.app.use(compression());

        // Logging
        if (process.env.NODE_ENV === 'development') {
            this.app.use(morgan('dev'));
        } else {
            this.app.use(morgan('combined', {
                stream: {
                    write: (message: string) => logger.info(message.trim())
                }
            }));
        }

        // Rate limiting
        this.app.use('/api/', rateLimiter);
        console.log('DEBUG: initializeMiddleware end');
    }

    private initializeRoutes(): void {
        console.log('DEBUG: initializeRoutes start');
        const apiVersion = process.env.API_VERSION || 'v1';
        const apiPrefix = `/api/${apiVersion}`;

        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV,
            });
        });

        // API routes
        this.app.use(`${apiPrefix}/auth`, authRoutes);
        this.app.use(`${apiPrefix}/battles`, authMiddleware, battleRoutes);
        this.app.use(`${apiPrefix}/problems`, authMiddleware, problemRoutes);
        this.app.use(`${apiPrefix}/submissions`, authMiddleware, submissionRoutes);
        this.app.use(`${apiPrefix}/users`, authMiddleware, userRoutes);
        this.app.use(`${apiPrefix}/tournaments`, authMiddleware, tournamentRoutes);

        // API documentation
        this.app.get(`${apiPrefix}`, (req, res) => {
            res.json({
                message: 'ETS PREP DSA Battles API',
                version: apiVersion,
                endpoints: {
                    auth: `${apiPrefix}/auth`,
                    battles: `${apiPrefix}/battles`,
                    problems: `${apiPrefix}/problems`,
                    submissions: `${apiPrefix}/submissions`,
                    users: `${apiPrefix}/users`,
                    tournaments: `${apiPrefix}/tournaments`,
                },
                documentation: '/api/docs',
            });
        });
        console.log('DEBUG: initializeRoutes end');
    }

    private initializeWebSocket(): void {
        console.log('DEBUG: initializeWebSocket start');
        initializeSocketIO(this.io);
        logger.info('WebSocket server initialized');
        console.log('DEBUG: initializeWebSocket end');
    }

    private initializeErrorHandling(): void {
        // 404 handler
        this.app.use(notFoundHandler);

        // Global error handler
        this.app.use(errorHandler);
    }

    public async start(): Promise<void> {
        try {
            console.log('DEBUG: start() called');
            // Initialize Redis
            await RedisService.getInstance().connect();
            logger.info('Redis connected successfully');

            // Start server
            console.log('DEBUG: Calling listen...');
            this.httpServer.listen(this.port, () => {
                logger.info(`🚀 Server running on port ${this.port}`);
                logger.info(`📡 Environment: ${process.env.NODE_ENV}`);
                logger.info(`🔌 WebSocket server ready`);
                logger.info(`📚 API Documentation: http://localhost:${this.port}/api/v1`);
            });

            // Graceful shutdown
            this.setupGracefulShutdown();
        } catch (error) {
            console.error('FATAL ERROR STARTING SERVER:', error);
            logger.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    private setupGracefulShutdown(): void {
        const shutdown = async (signal: string) => {
            logger.info(`${signal} received. Starting graceful shutdown...`);

            // Close HTTP server
            this.httpServer.close(() => {
                logger.info('HTTP server closed');
            });

            // Close WebSocket connections
            this.io.close(() => {
                logger.info('WebSocket server closed');
            });

            // Close Redis connection
            await RedisService.getInstance().disconnect();
            logger.info('Redis connection closed');

            process.exit(0);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
}

// Start server
try {
    console.log('DEBUG: Entry point - instantiating Server');
    const server = new Server();
    console.log('DEBUG: Server instantiated - calling start');
    server.start();
} catch (error) {
    console.error('FATAL ERROR AT TOP LEVEL:', error);
    process.exit(1);
}

export default Server; // Only export the class type if needed, or null


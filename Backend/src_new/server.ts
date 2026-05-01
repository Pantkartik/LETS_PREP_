import 'dotenv/config';
import express, { Application } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

// Configs
import corsOptions from './config/cors';
import { globalLimiter } from './config/rateLimit';
import logger from './config/logger';
import redisService from './services/redis.service';

// Middleware
import errorHandler from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import problemRoutes from './routes/problem.routes';
import submissionRoutes from './routes/submission.routes';
import battleRoutes from './routes/battle.routes';

// Sockets
import { initializeSocketIO } from './sockets';

class Server {
  private app: Application;
  private httpServer;
  private io: SocketIOServer;
  private port: number;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.port = parseInt(process.env.PORT || '3001');

    this.io = new SocketIOServer(this.httpServer, {
      cors: corsOptions,
      pingInterval: 25000,
      pingTimeout: 60000,
    });

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeWebSocket();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors(corsOptions));
    this.app.use(compression());
    this.app.use(cookieParser());
    
    const morganFormat = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
    this.app.use(morgan(morganFormat, {
      stream: { write: (message) => logger.info(message.trim()) }
    }));

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use('/api/', globalLimiter);
  }

  private initializeRoutes(): void {
    const apiVersion = process.env.API_VERSION || 'v1';
    const apiPrefix = `/api/${apiVersion}`;

    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
      });
    });

    // Domain Routes
    this.app.use(`${apiPrefix}/auth`, authRoutes);
    this.app.use(`${apiPrefix}/users`, userRoutes);
    this.app.use(`${apiPrefix}/problems`, problemRoutes);
    this.app.use(`${apiPrefix}/submissions`, submissionRoutes);
    this.app.use(`${apiPrefix}/battles`, battleRoutes);
  }

  private initializeWebSocket(): void {
    initializeSocketIO(this.io);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      await redisService.connect();
      logger.info('Redis connected successfully');

      this.httpServer.listen(this.port, () => {
        logger.info(`🚀 Server running on port ${this.port} [${process.env.NODE_ENV}]`);
        logger.info(`🔌 WebSocket server ready`);
      });

      this.setupGracefulShutdown();
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.warn(`${signal} received. Shutting down gracefully...`);
      this.httpServer.close(() => logger.info('HTTP server closed'));
      this.io.close(() => logger.info('WebSocket server closed'));
      await redisService.disconnect();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

const server = new Server();
server.start();

export default server;

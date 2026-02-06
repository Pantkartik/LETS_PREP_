import Queue from 'bull';
import { logger } from '../config/logger';


export class QueueService {
    private static instance: QueueService;
    private executionQueue: Queue.Queue;

    private constructor() {
        const redisConfig = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD
        };

        this.executionQueue = new Queue('code-execution', {
            redis: redisConfig,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000
                },
                removeOnComplete: 100,
                removeOnFail: 500
            }
        });

        this.executionQueue.on('error', (error) => {
            logger.error('Queue error:', error);
        });

        this.executionQueue.on('failed', (job, err) => {
            logger.error(`Job ${job.id} failed:`, err);
        });
    }

    public static getInstance(): QueueService {
        if (!QueueService.instance) {
            QueueService.instance = new QueueService();
        }
        return QueueService.instance;
    }

    public async addExecutionJob(data: any): Promise<Queue.Job> {
        return this.executionQueue.add(data);
    }

    public getQueue(): Queue.Queue {
        return this.executionQueue;
    }

    public async cleanOldJobs(): Promise<void> {
        await this.executionQueue.clean(1000 * 60 * 60 * 24, 'completed');
        await this.executionQueue.clean(1000 * 60 * 60 * 24 * 7, 'failed');
    }
}

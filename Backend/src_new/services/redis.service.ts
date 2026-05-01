import Redis from 'ioredis';
import logger from '../config/logger';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const RedisMock = require('ioredis-mock');

class RedisService {
  private static instance: RedisService;
  private client: Redis;

  private constructor() {
    const isMock = process.env.REDIS_MOCK === 'true';

    if (isMock) {
      logger.info('Using in-memory Redis mock');
      this.client = new RedisMock();
    } else {
      this.client = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });
    }

    this.setupListeners();
  }

  private setupListeners() {
    this.client.on('connect', () => logger.info('Redis client connected'));
    this.client.on('error', (error) => logger.error('Redis client error', { error }));
    this.client.on('close', () => logger.warn('Redis client connection closed'));
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public async connect(): Promise<void> {
    if (process.env.REDIS_MOCK === 'true') return;
    await this.client.ping();
  }

  public async disconnect(): Promise<void> {
    await this.client.quit();
  }

  // Generic Cache methods
  public async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  public async set(key: string, value: any, expirySeconds?: number): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    if (expirySeconds) {
      await this.client.setex(key, expirySeconds, stringValue);
    } else {
      await this.client.set(key, stringValue);
    }
  }

  public async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  // Battle state management helpers
  public async setBattleState(battleId: string, state: any): Promise<void> {
    await this.set(`battle:${battleId}:state`, state, 3600);
  }

  public async getBattleState<T>(battleId: string): Promise<T | null> {
    return this.get<T>(`battle:${battleId}:state`);
  }

  // Leaderboard (Sorted Sets)
  public async updateLeaderboard(battleId: string, userId: string, score: number): Promise<void> {
    await this.client.zadd(`battle:${battleId}:leaderboard`, score, userId);
  }

  public async getLeaderboard(battleId: string, limit = 10): Promise<{ userId: string, score: number }[]> {
    const results = await this.client.zrevrange(`battle:${battleId}:leaderboard`, 0, limit - 1, 'WITHSCORES');
    const leaderboard = [];
    for (let i = 0; i < results.length; i += 2) {
      leaderboard.push({ userId: results[i], score: parseFloat(results[i + 1]) });
    }
    return leaderboard;
  }

  public getClient(): Redis {
    return this.client;
  }
}

export const redisService = RedisService.getInstance();
export default redisService;

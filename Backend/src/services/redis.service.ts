import Redis from 'ioredis';
import { logger } from '../config/logger';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const RedisMock = require('ioredis-mock');

export class RedisService {
    private static instance: RedisService;
    private client: Redis;

    private constructor() {
        if (process.env.REDIS_MOCK === 'true') {
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

        this.client.on('connect', () => {
            logger.info('Redis client connected');
        });

        this.client.on('error', (error) => {
            logger.error('Redis client error', { error });
        });

        this.client.on('close', () => {
            logger.warn('Redis client connection closed');
        });
    }

    public static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    public async connect(): Promise<void> {
        try {
            if (process.env.REDIS_MOCK === 'true') {
                logger.info('Redis mock connection established');
                return;
            }
            await this.client.ping();
            logger.info('Redis connection established');
        } catch (error) {
            logger.error('Failed to connect to Redis', { error });
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        await this.client.quit();
    }

    // Cache operations
    public async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }

    public async set(key: string, value: string, expirySeconds?: number): Promise<void> {
        if (expirySeconds) {
            await this.client.setex(key, expirySeconds, value);
        } else {
            await this.client.set(key, value);
        }
    }

    public async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    public async exists(key: string): Promise<boolean> {
        const result = await this.client.exists(key);
        return result === 1;
    }

    // Hash operations
    public async hget(key: string, field: string): Promise<string | null> {
        return await this.client.hget(key, field);
    }

    public async hset(key: string, field: string, value: string): Promise<void> {
        await this.client.hset(key, field, value);
    }

    public async hgetall(key: string): Promise<Record<string, string>> {
        return await this.client.hgetall(key);
    }

    public async hdel(key: string, field: string): Promise<void> {
        await this.client.hdel(key, field);
    }

    // List operations
    public async lpush(key: string, value: string): Promise<void> {
        await this.client.lpush(key, value);
    }

    public async rpush(key: string, value: string): Promise<void> {
        await this.client.rpush(key, value);
    }

    public async lrange(key: string, start: number, stop: number): Promise<string[]> {
        return await this.client.lrange(key, start, stop);
    }

    // Set operations
    public async sadd(key: string, member: string): Promise<void> {
        await this.client.sadd(key, member);
    }

    public async srem(key: string, member: string): Promise<void> {
        await this.client.srem(key, member);
    }

    public async smembers(key: string): Promise<string[]> {
        return await this.client.smembers(key);
    }

    public async sismember(key: string, member: string): Promise<boolean> {
        const result = await this.client.sismember(key, member);
        return result === 1;
    }

    // Pub/Sub operations
    public async publish(channel: string, message: string): Promise<void> {
        await this.client.publish(channel, message);
    }

    public subscribe(channel: string, callback: (message: string) => void): void {
        const subscriber = this.client.duplicate();
        subscriber.subscribe(channel);
        subscriber.on('message', (ch, message) => {
            if (ch === channel) {
                callback(message);
            }
        });
    }

    // Battle-specific operations
    public async addUserToBattle(battleId: string, userId: string): Promise<void> {
        await this.sadd(`battle:${battleId}:users`, userId);
    }

    public async removeUserFromBattle(battleId: string, userId: string): Promise<void> {
        await this.srem(`battle:${battleId}:users`, userId);
    }

    public async getBattleUsers(battleId: string): Promise<string[]> {
        return await this.smembers(`battle:${battleId}:users`);
    }

    public async setBattleState(battleId: string, state: any): Promise<void> {
        await this.set(`battle:${battleId}:state`, JSON.stringify(state), 3600); // 1 hour expiry
    }

    public async getBattleState(battleId: string): Promise<any | null> {
        const state = await this.get(`battle:${battleId}:state`);
        return state ? JSON.parse(state) : null;
    }

    // Leaderboard operations (Sorted Sets)
    public async addToLeaderboard(battleId: string, userId: string, score: number): Promise<void> {
        await this.client.zadd(`battle:${battleId}:leaderboard`, score, userId);
    }

    public async getLeaderboard(battleId: string, limit: number = 10): Promise<Array<{ userId: string; score: number }>> {
        const results = await this.client.zrevrange(`battle:${battleId}:leaderboard`, 0, limit - 1, 'WITHSCORES');
        const leaderboard: Array<{ userId: string; score: number }> = [];

        for (let i = 0; i < results.length; i += 2) {
            leaderboard.push({
                userId: results[i],
                score: parseFloat(results[i + 1]),
            });
        }

        return leaderboard;
    }

    public async getUserRank(battleId: string, userId: string): Promise<number | null> {
        const rank = await this.client.zrevrank(`battle:${battleId}:leaderboard`, userId);
        return rank !== null ? rank + 1 : null;
    }

    // Session management
    public async setUserSession(userId: string, sessionData: any, expirySeconds: number = 86400): Promise<void> {
        await this.set(`session:${userId}`, JSON.stringify(sessionData), expirySeconds);
    }

    public async getUserSession(userId: string): Promise<any | null> {
        const session = await this.get(`session:${userId}`);
        return session ? JSON.parse(session) : null;
    }

    public async deleteUserSession(userId: string): Promise<void> {
        await this.del(`session:${userId}`);
    }

    // Rate limiting
    public async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
        const current = await this.client.incr(key);

        if (current === 1) {
            await this.client.expire(key, windowSeconds);
        }

        return current <= limit;
    }

    public getClient(): Redis {
        return this.client;
    }
}

import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../providers/redis.provider';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /**
   * Set a key-value pair in Redis with optional expiration
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
      this.logger.debug(`Cache set: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to set cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a value from Redis by key
   */
  async get(key: string): Promise<any> {
    try {
      const value = await this.redis.get(key);
      if (value === null) {
        this.logger.debug(`Cache miss: ${key}`);
        return null;
      }
      
      this.logger.debug(`Cache hit: ${key}`);
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      this.logger.error(`Failed to get cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete a key from Redis
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      this.logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if a key exists in Redis
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check existence of cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set expiration time for a key
   */
  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.redis.expire(key, ttl);
      this.logger.debug(`Cache expiration set: ${key} (${ttl}s)`);
    } catch (error) {
      this.logger.error(`Failed to set expiration for cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get the remaining time to live for a key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      this.logger.error(`Failed to get TTL for cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<{ status: string; message: string; timestamp: string }> {
    try {
      const startTime = Date.now();
      await this.redis.ping();
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        message: `Redis is responding (${responseTime}ms)`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return {
        status: 'unhealthy',
        message: `Redis connection failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get Redis connection info
   */
  async getConnectionInfo(): Promise<any> {
    try {
      const info = await this.redis.info();
      
      return {
        info: info.split('\r\n').filter(line => line && !line.startsWith('#')),
        status: this.redis.status,
        options: this.redis.options,
      };
    } catch (error) {
      this.logger.error('Failed to get Redis connection info:', error);
      throw error;
    }
  }
} 
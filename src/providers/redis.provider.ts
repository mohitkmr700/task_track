import { Provider, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: async (configService: ConfigService) => {
    const logger = new Logger('RedisProvider');
    const redisConfig = configService.get('redis');
    
    logger.log('🔧 Initializing Redis connection...');
    
    const redis = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db,
      maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
      connectTimeout: redisConfig.connectTimeout,
      lazyConnect: redisConfig.lazyConnect,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn(`🔄 Redis retry attempt ${times}, waiting ${delay}ms`);
        return delay;
      },
    });

    // Add event listeners for connection status
    redis.on('connect', () => {
      logger.log('✅ Redis connected successfully');
      console.log('✅ Redis connected successfully');
    });

    redis.on('error', (error) => {
      logger.error('❌ Redis connection error:', error);
      console.error('❌ Redis connection error:', error.message);
    });

    redis.on('ready', () => {
      logger.log('🚀 Redis is ready to accept commands');
      console.log('🚀 Redis is ready to accept commands');
    });

    redis.on('close', () => {
      logger.warn('🔌 Redis connection closed');
      console.log('🔌 Redis connection closed');
    });

    redis.on('reconnecting', () => {
      logger.warn('🔄 Redis reconnecting...');
      console.log('🔄 Redis reconnecting...');
    });

    redis.on('end', () => {
      logger.warn('🏁 Redis connection ended');
      console.log('🏁 Redis connection ended');
    });

    // Test the connection
    try {
      await redis.ping();
      logger.log('🏓 Redis ping successful');
      console.log('🏓 Redis ping successful');
    } catch (error) {
      logger.error('🏓 Redis ping failed:', error);
      console.error('🏓 Redis ping failed:', error.message);
    }

    return redis;
  },
  inject: [ConfigService],
}; 
import { registerAs } from '@nestjs/config';
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class RedisConfig {
  @IsString()
  @IsOptional()
  host?: string = 'localhost';

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  port?: number = 6379;

  @IsString()
  @IsOptional()
  password?: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  db?: number = 0;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  retryDelayOnFailover?: number = 100;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  maxRetriesPerRequest?: number = 3;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  connectTimeout?: number = 10000;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  lazyConnect?: boolean = true;
}

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB, 10) : 0,
  retryDelayOnFailover: process.env.REDIS_RETRY_DELAY_ON_FAILOVER ? parseInt(process.env.REDIS_RETRY_DELAY_ON_FAILOVER, 10) : 100,
  maxRetriesPerRequest: process.env.REDIS_MAX_RETRIES_PER_REQUEST ? parseInt(process.env.REDIS_MAX_RETRIES_PER_REQUEST, 10) : 3,
  connectTimeout: process.env.REDIS_CONNECT_TIMEOUT ? parseInt(process.env.REDIS_CONNECT_TIMEOUT, 10) : 10000,
  lazyConnect: process.env.REDIS_LAZY_CONNECT === 'true' || true,
})); 
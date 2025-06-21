import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisProvider } from '../providers/redis.provider';
import { RedisService } from '../services/redis.service';
import { StartupService } from '../services/startup.service';
import redisConfig from '../config/redis.config';

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(redisConfig),
  ],
  providers: [RedisProvider, RedisService, StartupService],
  exports: [RedisService],
})
export class RedisModule {} 
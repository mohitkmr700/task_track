import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class StartupService implements OnModuleInit {
  private readonly logger = new Logger(StartupService.name);

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    this.logger.log('🔧 Application modules initialized');
    
    // Wait a bit for Redis to connect
    setTimeout(async () => {
      try {
        const health = await this.redisService.healthCheck();
        this.logger.log('📊 Redis Health Check:');
        this.logger.log(`   Status: ${health.status}`);
        this.logger.log(`   Message: ${health.message}`);
        this.logger.log(`   Timestamp: ${health.timestamp}`);
        
        if (health.status === 'healthy') {
          this.logger.log('✅ Redis is ready for caching operations');
        } else {
          this.logger.warn('⚠️  Redis is not healthy, caching may not work properly');
        }
      } catch (error) {
        this.logger.error('❌ Failed to check Redis health:', error.message);
      }
    }, 1000);
  }
}

export default StartupService; 
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { TaskModule } from './task/task.module';
import { PermissionModule } from './permission/permission.module';
import { RedisModule } from './modules/redis.module';
import redisConfig from './config/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig],
      envFilePath: '.env',
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    RedisModule,
    TaskModule,
    PermissionModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

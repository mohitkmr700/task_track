import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { PocketBaseService } from '../services/pocketbase.service';
import { RedisModule } from '../modules/redis.module';

/**
 * TaskModule organizes the task-related components
 * Provides task management functionality through TaskController
 * Uses TaskService for business logic
 */
@Module({
  imports: [RedisModule],
  controllers: [TaskController],
  providers: [TaskService, PocketBaseService],
  exports: [TaskService],
})
export class TaskModule {}

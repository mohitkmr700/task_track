import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

/**
 * TaskModule organizes the task-related components
 * Provides task management functionality through TaskController
 * Uses TaskService for business logic
 */
@Module({
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}

import { Controller, Post, Body, Put, Delete, Get, Query } from '@nestjs/common';
import { TaskService } from './task.service';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('health')
  healthCheck() {
    return { status: 'ok' };
  }

  @Get()
  async listTasks(@Query('email') email: string) {
    return this.taskService.listTasks(email);
  }

  @Post()
  async createTask(@Body() body: any) {
    return this.taskService.createTask(body);
  }

  @Put()
  async updateTask(@Body() body: any) {
    return this.taskService.updateTask(body);
  }

  @Delete()
  async deleteTask(@Body('email') email: string) {
    return this.taskService.deleteTask(email);
  }
}

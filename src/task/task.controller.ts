import { Controller, Post, Body, Put, Delete, Get, Query, Param, BadRequestException } from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './task.interface';

/**
 * TaskController handles all task-related HTTP requests
 * Base route: /tasks
 */
@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  /**
   * Health check endpoint
   * Route: GET /health
   * @returns {Object} Health status of the API
   */
  @Get('health')
  healthCheck() {
    return { status: 'ok', statusCode: 200, message: 'Health check successful' };
  }

  /**
   * Get all tasks for a specific email
   * Route: GET /list?email={email}
   * @param {string} email - Email to filter tasks
   * @returns {Promise<Array>} List of tasks
   */
  @Get('list=all')
  async listTasks(@Query('email') email: string) {
    return this.taskService.listTasks(email);
  }

  /**
   * Create a new task
   * Route: POST /create-api
   * @param {Task} body - Task data
   * @returns {Promise<Task>} Created task
   */
  @Post('create-api')
  async createTask(@Body() body: Task): Promise<Task> {
    // Validate required fields
    if (!body.email) {
      throw new BadRequestException('Email is required');
    }
    if (!body.title) {
      throw new BadRequestException('Title is required');
    }
    if (!body.description) {
      throw new BadRequestException('Description is required');
    }

    // Convert progress to number if provided
    if (body.progress) {
      body.progress = Number(body.progress);
    }

    // Convert is_done to boolean if provided
    if (typeof body.is_done === 'string') {
      body.is_done = body.is_done === 'true';
    }

    return this.taskService.createTask(body);
  }

  /**
   * Update an existing task
   * Route: PUT /update
   * @param {Task} body - Updated task data
   * @returns {Promise<Task>} Updated task
   */
  @Put('update')
  async updateTask(@Body() body: Task): Promise<Task> {
    if (!body.id) {
      throw new BadRequestException('Task ID is required for update');
    }
    return this.taskService.updateTask(body.id, body);
  }

  /**
   * Delete a task by ID
   * Route: DELETE /remove
   * @param {Object} body - Contains task ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  @Delete('remove')
  async deleteTask(@Body() body: { id: string }) {
    if (!body.id) {
      throw new BadRequestException('Task ID is required for deletion');
    }
    return this.taskService.deleteTask(body.id);
  }
}

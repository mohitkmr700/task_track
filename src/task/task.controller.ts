import { Controller, Post, Body, Put, Delete, Get, Query, Param } from '@nestjs/common';
import { TaskService } from './task.service';

/**
 * TaskController handles all task-related HTTP requests
 * Base route: /tasks
 */
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  /**
   * Health check endpoint
   * Route: GET /tasks/health
   * @returns {Object} Health status of the API
   */
  @Get('health')
  healthCheck() {
    return { status: 'ok', statusCode: 200, message: 'Health check successful' };
  }

  /**
   * Get all tasks for a specific email
   * Route: GET /tasks?email={email}
   * @param {string} email - Email to filter tasks
   * @returns {Promise<Array>} List of tasks
   */
  @Get()
  async listTasks(@Query('email') email: string) {
    return this.taskService.listTasks(email);
  }

  /**
   * Create a new task
   * Route: POST /tasks
   * @param {Object} body - Task data
   * @returns {Promise<Object>} Created task
   */
  @Post()
  async createTask(@Body() body: any) {
    return this.taskService.createTask(body);
  }

  /**
   * Update an existing task
   * Route: PUT /tasks/update
   * @param {Object} body - Updated task data
   * @returns {Promise<Object>} Updated task
   */
  @Put('update')
  async updateTask(@Body() body: any) {
    return this.taskService.updateTask(body);
  }

  /**
   * Delete a task by ID
   * Route: DELETE /tasks/delete/:id
   * @param {string} id - ID of the task to delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  @Delete('delete/:id')
  async deleteTask(@Param('id') id: string) {
    return this.taskService.deleteTask(id);
  }
}

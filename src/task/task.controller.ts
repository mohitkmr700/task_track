import { Controller, Post, Body, Put, Delete, Get, Query, Param } from '@nestjs/common';
import { TaskService } from './task.service';

/**
 * TaskController handles all task-related HTTP requests
 * Base route: /api/tasks
 */
@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  /**
   * Health check endpoint
   * Route: GET /api/tasks/health
   * @returns {Object} Health status of the API
   */
  @Get('health')
  healthCheck() {
    return { status: 'ok', statusCode: 200, message: 'Health check successful' };
  }

  /**
   * Get all tasks for a specific email
   * Route: GET /api/tasks/list?email={email}
   * @param {string} email - Email to filter tasks
   * @returns {Promise<Array>} List of tasks
   */
  @Get('list')
  async listTasks(@Query('email') email: string) {
    return this.taskService.listTasks(email);
  }

  /**
   * Create a new task
   * Route: POST /api/tasks/create
   * @param {Object} body - Task data
   * @returns {Promise<Object>} Created task
   */
  @Post('create')
  async createTask(@Body() body: any) {
    return this.taskService.createTask(body);
  }

  /**
   * Update an existing task
   * Route: PUT /api/tasks/update
   * @param {Object} body - Updated task data
   * @returns {Promise<Object>} Updated task
   */
  @Put('update')
  async updateTask(@Body() body: any) {
    return this.taskService.updateTask(body.id, body);
  }

  /**
   * Delete a task by ID
   * Route: DELETE /api/tasks/remove
   * @param {Object} body - Contains task ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  @Delete('remove')
  async deleteTask(@Body() body: any) {
    console.log(`Received DELETE request for task id: ${body.id}`);
    try {
      const result = await this.taskService.deleteTask(body.id);
      console.log('Delete result:', {"status": "success", "message": "Task deleted successfully"});
      return result;
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  }
}

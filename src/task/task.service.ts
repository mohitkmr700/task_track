import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import PocketBase from 'pocketbase';
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * TaskService handles all task-related business logic
 * Integrates with PocketBase for data persistence
 */
@Injectable()
export class TaskService {
  private pb: PocketBase;

  constructor() {
    // Initialize PocketBase client with URL from environment variables
    this.pb = new PocketBase(process.env.POCKETBASE_URL || 'http://algoarena.co.in/pocketbase');
  }

  /**
   * Retrieve tasks filtered by email
   * @param {string} email - Optional email to filter tasks
   * @returns {Promise<Object>} List of tasks with status
   * @throws {NotFoundException} When no tasks are found
   */
  async listTasks(email?: string) {
    const filter = email ? `email = '${email}'` : '';
    const records = await this.pb.collection('task').getFullList({ filter });
    if (!records.length) {
      throw new NotFoundException('No tasks found for the specified email.');
    }
    return {
      statusCode: 200,
      message: 'Tasks retrieved successfully',
      data: records
    };
  }

  /**
   * Create a new task
   * @param {Object} data - Task data
   * @returns {Promise<Object>} Created task with status
   * @throws {ConflictException} When a task with the same title exists
   */
  async createTask(data: any) {
    // Check for duplicate task with the same title
    const existingTasks = await this.pb.collection('task').getFullList({
      filter: `title = '${data.title}'`
    });
    if (existingTasks.length) {
      throw new ConflictException('A task with this title already exists.');
    }
    const createdTask = await this.pb.collection('task').create(data);
    return {
      statusCode: 201,
      message: 'Task created successfully',
      data: createdTask
    };
  }

  /**
   * Update an existing task
   * @param {string} id - ID of the task to update
   * @param {Object} data - Updated task data
   * @returns {Promise<Object>} Update confirmation with status
   * @throws {NotFoundException} When task is not found
   */
  async updateTask(id: string, data: any) {
    try {
      const updatedTask = await this.pb.collection('task').update(id, data);
      return {
        statusCode: 200,
        message: 'Task updated successfully',
        data: updatedTask
      };
    } catch (error) {
      throw new NotFoundException('Task not found with the specified ID.');
    }
  }

  /**
   * Delete a task by ID
   * @param {string} id - ID of the task to delete
   * @returns {Promise<Object>} Deletion confirmation with status
   * @throws {NotFoundException} When task is not found
   */
  async deleteTask(id: string) {
    try {
      await this.pb.collection('task').delete(id);
      return {
        statusCode: 200,
        message: 'Task deleted successfully',
        data: { id }
      };
    } catch (error) {
      throw new NotFoundException('Task not found with the specified ID.');
    }
  }
}

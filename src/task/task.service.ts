import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import PocketBase from 'pocketbase';
import * as dotenv from 'dotenv';
import { Task } from './task.interface';
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
   */
  async listTasks(email?: string) {
    try {
      const filter = email ? `email = '${email}'` : '';
      const records = await this.pb.collection('task').getFullList({ 
        filter,
        sort: '-created' // Sort by created date in descending order
      });
      
      return {
        statusCode: 200,
        message: records.length ? 'Tasks retrieved successfully' : 'No tasks found',
        data: records
      };
    } catch (error) {
      Logger.error('Error listing tasks:', error);
      throw new NotFoundException('Failed to retrieve tasks. Please try again.');
    }
  }

  /**
   * Create a new task
   * @param {Task} data - Task data
   * @returns {Promise<Task>} Created task
   * @throws {ConflictException} When a task with the same title exists
   */
  async createTask(data: Task): Promise<Task> {
    try {
      // Create the task record
      const record = await this.pb.collection('task').create(data);
      return record;
    } catch (error) {
      Logger.error('Error creating task:', error);
      throw new ConflictException('Failed to create task. Please check your input data.');
    }
  }

  /**
   * Update an existing task
   * @param {string} id - ID of the task to update
   * @param {Task} data - Updated task data
   * @returns {Promise<Task>} Updated task
   * @throws {NotFoundException} When task is not found
   */
  async updateTask(id: string, data: Task): Promise<Task> {
    try {
      const updatedTask = await this.pb.collection('task').update(id, data);
      return updatedTask;
    } catch (error) {
      throw new NotFoundException('Task not found with the specified ID.');
    }
  }

  /**
   * Delete a task by ID
   * @param {string} id - ID of the task to delete
   * @returns {Promise<Object>} Deletion confirmation
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

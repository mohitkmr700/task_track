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
   * @returns {Promise<Array>} List of tasks
   * @throws {NotFoundException} When no tasks are found
   */
  async listTasks(email?: string) {
    const filter = email ? `email = '${email}'` : '';
    const records = await this.pb.collection('task').getFullList({ filter });
    if (!records.length) {
      throw new NotFoundException('No tasks found for the specified email.');
    }
    return records;
  }

  /**
   * Create a new task
   * @param {Object} data - Task data
   * @returns {Promise<Object>} Created task
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
    return this.pb.collection('task').create(data);
  }

  /**
   * Update an existing task
   * @param {Object} data - Updated task data
   * @returns {Promise<Object>} Updated task
   * @throws {NotFoundException} When task is not found
   */
  async updateTask(data: any) {
    // Find record by email
    const records = await this.pb.collection('task').getFullList({
      filter: `email = '${data.email}'`
    });
    if (!records.length) {
      throw new NotFoundException('Task not found for the specified email.');
    }
    const recordId = records[0].id;
    return this.pb.collection('task').update(recordId, data);
  }

  /**
   * Delete a task
   * @param {string} email - Email of the task to delete
   * @returns {Promise<Object>} Deletion confirmation
   * @throws {NotFoundException} When task is not found
   */
  async deleteTask(email: string) {
    // Find record by email
    const records = await this.pb.collection('task').getFullList({
      filter: `email = '${email}'`
    });
    if (!records.length) {
      throw new NotFoundException('Task not found for the specified email.');
    }
    const recordId = records[0].id;
    return this.pb.collection('task').delete(recordId);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PocketBaseService, ListOptions } from '../services/pocketbase.service';
import { Task } from './task.interface';
import { RedisService } from '../services/redis.service';

/**
 * TaskService handles all task-related business logic
 * Integrates with PocketBase for data persistence and Redis for caching
 */

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  private readonly COLLECTION_NAME = 'task';
  private readonly CACHE_PREFIX = 'task:';
  private readonly TASK_LIST_CACHE_PREFIX = 'task_list:';

  constructor(
    private readonly pocketBaseService: PocketBaseService,
    private readonly redisService: RedisService
  ) {}

  /**
   * Retrieve tasks filtered by email with Redis caching
   * @param {string} email - Optional email to filter tasks
   * @param {ListOptions} options - List options for pagination, filtering, etc.
   * @returns {Promise<Object>} List of tasks with status and cache info
   */
  async listTasks(email?: string, options: ListOptions = {}) {
    return this.pocketBaseService.getList(
      this.COLLECTION_NAME,
      options,
      this.TASK_LIST_CACHE_PREFIX,
      email
    );
  }

  /**
   * Get all tasks without pagination (no caching)
   * @param {string} email - Optional email to filter tasks
   * @param {ListOptions} options - List options for filtering, sorting, etc.
   * @returns {Promise<Object>} All tasks
   */
  async getAllTasks(email?: string, options: ListOptions = {}) {
    // Always fetch from database without caching
    const optionsWithoutCache = { ...options, cache: 'none' };
    return this.pocketBaseService.getFullList(
      this.COLLECTION_NAME,
      optionsWithoutCache,
      this.TASK_LIST_CACHE_PREFIX,
      email
    );
  }

  /**
   * Get a single task by ID with caching
   * @param {string} id - Task ID
   * @param {Object} options - Options including cache bypass
   * @returns {Promise<Task & { source: string }>} Task data with source info
   */
  async getTaskById(id: string, options: { cache?: string } = {}): Promise<Task & { source: string }> {
    return this.pocketBaseService.getById(
      this.COLLECTION_NAME,
      id,
      this.CACHE_PREFIX,
      options
    );
  }

  /**
   * Get first task that matches the filter
   * @param {string} filter - Filter string
   * @param {Object} options - Additional options including cache bypass
   * @returns {Promise<Task>} Task data
   */
  async getFirstTask(filter: string, options: { expand?: string; cache?: string } = {}): Promise<Task> {
    return this.pocketBaseService.getFirstListItem(
      this.COLLECTION_NAME,
      filter,
      options
    );
  }

  /**
   * Create a new task and invalidate related cache
   * @param {Task} data - Task data
   * @returns {Promise<Task>} Created task
   */
  async createTask(data: Task): Promise<Task> {
    return this.pocketBaseService.create(
      this.COLLECTION_NAME,
      data,
      this.CACHE_PREFIX
    );
  }

  /**
   * Update an existing task and invalidate related cache
   * @param {string} id - ID of the task to update
   * @param {Task} data - Updated task data
   * @returns {Promise<Task>} Updated task
   */
  async updateTask(id: string, data: Task): Promise<Task> {
    return this.pocketBaseService.update(
      this.COLLECTION_NAME,
      id,
      data,
      this.CACHE_PREFIX
    );
  }

  /**
   * Delete a task by ID and invalidate related cache
   * @param {string} id - ID of the task to delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteTask(id: string) {
    return this.pocketBaseService.delete(
      this.COLLECTION_NAME,
      id,
      this.CACHE_PREFIX
    );
  }

  /**
   * Health check for both database and cache
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    const dbHealth = await this.pocketBaseService.healthCheck();
    const cacheHealth = await this.redisService.healthCheck();
    
    return {
      timestamp: new Date().toISOString(),
      database: dbHealth,
      cache: cacheHealth,
      overall: dbHealth.status === 'healthy' && cacheHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
    };
  }
}

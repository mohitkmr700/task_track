import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import PocketBase from 'pocketbase';
import * as dotenv from 'dotenv';
import { Task } from './task.interface';
import { RedisService } from '../services/redis.service';

dotenv.config();

/**
 * TaskService handles all task-related business logic
 * Integrates with PocketBase for data persistence and Redis for caching
 */
@Injectable()
export class TaskService {
  private pb: PocketBase;
  private readonly logger = new Logger(TaskService.name);
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly TASK_CACHE_PREFIX = 'task:';
  private readonly TASK_LIST_CACHE_PREFIX = 'task_list:';

  constructor(private readonly redisService: RedisService) {
    // Initialize PocketBase client with URL from environment variables
    this.pb = new PocketBase(process.env.POCKETBASE_URL || 'http://algoarena.co.in/pocketbase');
  }

  /**
   * Retrieve tasks filtered by email with Redis caching
   * @param {string} email - Optional email to filter tasks
   * @returns {Promise<Object>} List of tasks with status and cache info
   */
  async listTasks(email?: string) {
    try {
      const cacheKey = `${this.TASK_LIST_CACHE_PREFIX}${email || 'all'}`;
      
      // Try to get from cache first
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        this.logger.log(`Cache hit for tasks list (email: ${email || 'all'})`);
        return {
          ...cachedData,
          source: 'cache',
          cacheKey,
        };
      }

      // If not in cache, get from database
      this.logger.log(`Cache miss for tasks list (email: ${email || 'all'}), fetching from database`);
      const filter = email ? `email = '${email}'` : '';
      const records = await this.pb.collection('task').getFullList({ 
        filter,
        sort: '-created' // Sort by created date in descending order
      });
      
      const result = {
        statusCode: 200,
        message: records.length ? 'Tasks retrieved successfully' : 'No tasks found',
        data: records,
        source: 'database',
        cacheKey,
      };

      // Cache the result
      await this.redisService.set(cacheKey, result, this.CACHE_TTL);
      this.logger.log(`Cached tasks list for key: ${cacheKey}`);

      return result;
    } catch (error) {
      this.logger.error('Error listing tasks:', error);
      throw new NotFoundException('Failed to retrieve tasks. Please try again.');
    }
  }

  /**
   * Create a new task and invalidate related cache
   * @param {Task} data - Task data
   * @returns {Promise<Task>} Created task
   * @throws {ConflictException} When a task with the same title exists
   */
  async createTask(data: Task): Promise<Task> {
    try {
      // Create the task record
      const record = await this.pb.collection('task').create(data);
      
      // Invalidate related caches
      if (data.email) {
        await this.invalidateTaskCaches(data.email);
      }
      
      this.logger.log(`Task created and cache invalidated for email: ${data.email || 'unknown'}`);
      return record;
    } catch (error) {
      this.logger.error('Error creating task:', error);
      throw new ConflictException('Failed to create task. Please check your input data.');
    }
  }

  /**
   * Update an existing task and invalidate related cache
   * @param {string} id - ID of the task to update
   * @param {Task} data - Updated task data
   * @returns {Promise<Task>} Updated task
   * @throws {NotFoundException} When task is not found
   */
  async updateTask(id: string, data: Task): Promise<Task> {
    try {
      const updatedTask = await this.pb.collection('task').update(id, data);
      
      // Invalidate related caches
      if (data.email) {
        await this.invalidateTaskCaches(data.email);
      }
      
      this.logger.log(`Task updated and cache invalidated for email: ${data.email || 'unknown'}`);
      return updatedTask;
    } catch (error) {
      throw new NotFoundException('Task not found with the specified ID.');
    }
  }

  /**
   * Delete a task by ID and invalidate related cache
   * @param {string} id - ID of the task to delete
   * @returns {Promise<Object>} Deletion confirmation
   * @throws {NotFoundException} When task is not found
   */
  async deleteTask(id: string) {
    try {
      // Get the task first to know which email to invalidate cache for
      const task = await this.pb.collection('task').getOne(id);
      
      await this.pb.collection('task').delete(id);
      
      // Invalidate related caches
      await this.invalidateTaskCaches(task.email);
      
      this.logger.log(`Task deleted and cache invalidated for email: ${task.email}`);
      return {
        statusCode: 200,
        message: 'Task deleted successfully',
        data: { id }
      };
    } catch (error) {
      throw new NotFoundException('Task not found with the specified ID.');
    }
  }

  /**
   * Get a single task by ID with caching
   * @param {string} id - Task ID
   * @returns {Promise<Task & { source: string }>} Task data with source info
   */
  async getTaskById(id: string): Promise<Task & { source: string }> {
    try {
      const cacheKey = `${this.TASK_CACHE_PREFIX}${id}`;
      
      // Try to get from cache first
      const cachedTask = await this.redisService.get(cacheKey);
      if (cachedTask) {
        this.logger.log(`Cache hit for task: ${id}`);
        return {
          ...cachedTask,
          source: 'cache',
        };
      }

      // If not in cache, get from database
      this.logger.log(`Cache miss for task: ${id}, fetching from database`);
      const task = await this.pb.collection('task').getOne(id);
      
      // Cache the task
      await this.redisService.set(cacheKey, task, this.CACHE_TTL);
      this.logger.log(`Cached task for key: ${cacheKey}`);

      return {
        ...task,
        source: 'database',
      };
    } catch (error) {
      this.logger.error(`Error getting task by ID ${id}:`, error);
      throw new NotFoundException('Task not found with the specified ID.');
    }
  }

  /**
   * Health check for both database and cache
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    const dbHealth = await this.checkDatabaseHealth();
    const cacheHealth = await this.redisService.healthCheck();
    
    return {
      timestamp: new Date().toISOString(),
      database: dbHealth,
      cache: cacheHealth,
      overall: dbHealth.status === 'healthy' && cacheHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
    };
  }

  /**
   * Check database connectivity
   * @returns {Promise<Object>} Database health status
   */
  private async checkDatabaseHealth() {
    try {
      const startTime = Date.now();
      await this.pb.collection('task').getList(1, 1);
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        message: `Database is responding (${responseTime}ms)`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        message: `Database connection failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Invalidate all task-related caches for a specific email
   * @param {string} email - Email to invalidate caches for
   */
  private async invalidateTaskCaches(email: string) {
    try {
      const keysToDelete = [
        `${this.TASK_LIST_CACHE_PREFIX}${email}`,
        `${this.TASK_LIST_CACHE_PREFIX}all`,
      ];
      
      for (const key of keysToDelete) {
        await this.redisService.del(key);
        this.logger.debug(`Invalidated cache key: ${key}`);
      }
    } catch (error) {
      this.logger.error('Error invalidating task caches:', error);
    }
  }
}

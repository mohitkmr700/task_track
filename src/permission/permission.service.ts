import { Injectable, Logger } from '@nestjs/common';
import { PocketBaseService, ListOptions } from '../services/pocketbase.service';
import { Permission } from './permission.interface';
import { RedisService } from '../services/redis.service';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);
  private readonly COLLECTION_NAME = 'control_system';
  private readonly CACHE_PREFIX = 'permission:';
  private readonly PERMISSION_LIST_CACHE_PREFIX = 'permission_list:';

  constructor(
    private readonly pocketBaseService: PocketBaseService,
    private readonly redisService: RedisService
  ) {}

  /**
   * Get all permissions with optional filtering
   * @param email - Optional email to filter permissions
   * @param options - List options for pagination, filtering, etc.
   * @returns Promise with permissions list
   */
  async listPermissions(email?: string, options: ListOptions = {}) {
    return this.pocketBaseService.getList(
      this.COLLECTION_NAME,
      options,
      this.PERMISSION_LIST_CACHE_PREFIX,
      email
    );
  }

  /**
   * Get all permissions without pagination
   * @param email - Optional email to filter permissions
   * @param options - List options for filtering, sorting, etc.
   * @returns Promise with all permissions
   */
  async getAllPermissions(email?: string, options: ListOptions = {}) {
    return this.pocketBaseService.getFullList(
      this.COLLECTION_NAME,
      options,
      this.PERMISSION_LIST_CACHE_PREFIX,
      email
    );
  }

  /**
   * Get a single permission by ID
   * @param id - Permission ID
   * @param options - Options including cache bypass
   * @returns Promise with permission data
   */
  async getPermissionById(id: string, options: { cache?: string } = {}) {
    return this.pocketBaseService.getById(
      this.COLLECTION_NAME,
      id,
      this.CACHE_PREFIX,
      options
    );
  }

  /**
   * Get first permission that matches the filter
   * @param filter - Filter string
   * @param options - Additional options including cache bypass
   * @returns Promise with permission data
   */
  async getFirstPermission(filter: string, options: { expand?: string; cache?: string } = {}) {
    return this.pocketBaseService.getFirstListItem(
      this.COLLECTION_NAME,
      filter,
      options
    );
  }

  /**
   * Create a new permission
   * @param data - Permission data
   * @returns Promise with created permission
   */
  async createPermission(data: Permission): Promise<Permission> {
    // Validate and process JSON fields
    const processedData = this.processPermissionData(data);
    return this.pocketBaseService.create(
      this.COLLECTION_NAME,
      processedData,
      this.CACHE_PREFIX
    );
  }

  /**
   * Update an existing permission
   * @param id - Permission ID
   * @param data - Updated permission data
   * @returns Promise with updated permission
   */
  async updatePermission(id: string, data: Permission): Promise<Permission> {
    // Validate and process JSON fields
    const processedData = this.processPermissionData(data);
    return this.pocketBaseService.update(
      this.COLLECTION_NAME,
      id,
      processedData,
      this.CACHE_PREFIX
    );
  }

  /**
   * Delete a permission by ID
   * @param id - Permission ID
   * @returns Promise with deletion confirmation
   */
  async deletePermission(id: string) {
    return this.pocketBaseService.delete(
      this.COLLECTION_NAME,
      id,
      this.CACHE_PREFIX
    );
  }

  /**
   * Get all modules listing
   * @param options - List options for filtering, sorting, etc.
   * @returns Promise with modules list
   */
  async getModulesList(options: ListOptions = {}) {
    try {
      const cacheKey = `${this.PERMISSION_LIST_CACHE_PREFIX}modules`;
      const { cache, ...listOptions } = options;
      const bypassCache = cache === 'none';
      
      // If cache=none is passed, delete existing cache and always fetch from database
      if (bypassCache) {
        this.logger.log(`Cache bypassed for modules list, deleting existing cache and fetching from database`);
        
        // Delete existing cache if it exists
        await this.redisService.del(cacheKey);
        this.logger.log(`Deleted existing cache for key: ${cacheKey}`);
        
        const { filter = '', sort = '-created', expand = '' } = listOptions;
        
        const records = await this.pocketBaseService.getFullList(
          this.COLLECTION_NAME,
          { filter, sort, expand },
          this.PERMISSION_LIST_CACHE_PREFIX
        );
        
        const response = {
          statusCode: 200,
          message: records.data.length ? 'Modules retrieved successfully' : 'No modules found',
          data: records.data,
          source: 'database (cache bypassed)',
          cacheKey,
        };

        // DO NOT cache when cache=none - always fetch fresh data
        this.logger.log(`Cache bypassed - not caching result for key: ${cacheKey}`);

        return response;
      }

      // Normal cache behavior - try to get from cache first
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        this.logger.log('Cache hit for modules list');
        return {
          ...cachedData,
          source: 'cache',
          cacheKey,
        };
      }

      // If not in cache, get from database
      this.logger.log('Cache miss for modules list, fetching from database');
      
      const { filter = '', sort = '-created', expand = '' } = listOptions;
      
      const records = await this.pocketBaseService.getFullList(
        this.COLLECTION_NAME,
        { filter, sort, expand },
        this.PERMISSION_LIST_CACHE_PREFIX
      );
      
      const response = {
        statusCode: 200,
        message: records.data.length ? 'Modules retrieved successfully' : 'No modules found',
        data: records.data,
        source: 'database',
        cacheKey,
      };

      // Cache the result only for normal requests (not cache=none)
      await this.redisService.set(cacheKey, response, 300); // 5 minutes cache
      this.logger.log(`Cached modules list for key: ${cacheKey}`);

      return response;
    } catch (error) {
      this.logger.error('Error listing modules:', error);
      throw error;
    }
  }

  /**
   * Health check for both database and cache
   * @returns Promise with health status
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

  /**
   * Process permission data to ensure JSON fields are properly formatted
   * @param data - Permission data
   * @returns Processed permission data
   */
  private processPermissionData(data: Permission): Permission {
    const processedData = { ...data };

    // Ensure modules is a JSON string
    if (processedData.modules && typeof processedData.modules === 'object') {
      processedData.modules = JSON.stringify(processedData.modules);
    }

    // Ensure permissions is a JSON string
    if (processedData.permissions && typeof processedData.permissions === 'object') {
      processedData.permissions = JSON.stringify(processedData.permissions);
    }

    return processedData;
  }
} 
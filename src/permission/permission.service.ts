import { Injectable, Logger } from '@nestjs/common';
import { PocketBaseService } from '../services/pocketbase.service';
import { RedisService } from '../services/redis.service';
import { Permission } from './permission.interface';

export interface ListOptions {
  page?: number;
  perPage?: number;
  filter?: string;
  sort?: string;
  expand?: string;
  cache?: string; // 'none' to bypass cache
}

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
   * Get the latest permission by email
   * @param email - Email to filter permissions
   * @param options - Options including cache bypass
   * @returns Promise with latest permission data
   */
  async getLatestPermission(email: string, options: { cache?: string } = {}) {
    try {
      const cacheKey = `${this.PERMISSION_LIST_CACHE_PREFIX}${email}`;
      const { cache } = options;
      const bypassCache = cache === 'none';
      
      // If cache=none is passed, delete existing cache and always fetch from database
      if (bypassCache) {
        this.logger.log(`Cache bypassed for latest permission (email: ${email}), deleting existing cache and fetching from database`);
        
        // Delete existing cache if it exists
        await this.redisService.del(cacheKey);
        this.logger.log(`Deleted existing cache for key: ${cacheKey}`);
        
        // Get the latest permission by email, sorted by created date descending
        const filter = `email = '${email}'`;
        const sort = '-created';
        
        const result = await this.pocketBaseService.getList(
          this.COLLECTION_NAME,
          { filter, sort, perPage: 1, page: 1 },
          this.PERMISSION_LIST_CACHE_PREFIX,
          email
        );
        
        const latestPermission = result.data.length > 0 ? this.convertToLocalTime(result.data[0]) : null;
        
        const response = {
          statusCode: 200,
          message: latestPermission ? 'Latest permission retrieved successfully' : 'No permission found for this email',
          data: latestPermission,
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
        this.logger.log(`Cache hit for latest permission (email: ${email})`);
        return {
          ...cachedData,
          source: 'cache',
          cacheKey,
        };
      }

      // If not in cache, get from database
      this.logger.log(`Cache miss for latest permission (email: ${email}), fetching from database`);
      
      // Get the latest permission by email, sorted by created date descending
      const filter = `email = '${email}'`;
      const sort = '-created';
      
      const result = await this.pocketBaseService.getList(
        this.COLLECTION_NAME,
        { filter, sort, perPage: 1, page: 1 },
        this.PERMISSION_LIST_CACHE_PREFIX,
        email
      );
      
      const latestPermission = result.data.length > 0 ? this.convertToLocalTime(result.data[0]) : null;
      
      const response = {
        statusCode: 200,
        message: latestPermission ? 'Latest permission retrieved successfully' : 'No permission found for this email',
        data: latestPermission,
        source: 'database',
        cacheKey,
      };

      // Cache the result only for normal requests (not cache=none)
      await this.redisService.set(cacheKey, response, 300); // 5 minutes cache
      this.logger.log(`Cached latest permission for key: ${cacheKey}`);

      return response;
    } catch (error) {
      this.logger.error('Error getting latest permission:', error);
      throw error;
    }
  }

  /**
   * Convert timestamps to local time
   * @param permission - Permission object with timestamps
   * @returns Permission object with local time timestamps
   */
  private convertToLocalTime(permission: any): any {
    if (!permission) return permission;

    const converted = { ...permission };

    // Convert created timestamp to local time (keeping ISO format)
    if (converted.created) {
      const utcDate = new Date(converted.created);
      const localDate = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000));
      converted.created = localDate.toISOString().replace('Z', '');
    }

    // Convert updated timestamp to local time (keeping ISO format)
    if (converted.updated) {
      const utcDate = new Date(converted.updated);
      const localDate = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000));
      converted.updated = localDate.toISOString().replace('Z', '');
    }

    return converted;
  }
} 
import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import PocketBase from 'pocketbase';
import * as dotenv from 'dotenv';
import { RedisService } from './redis.service';

dotenv.config();

export interface PocketBaseRecord {
  id?: string;
  created?: string;
  updated?: string;
  collectionId?: string;
  collectionName?: string;
  [key: string]: any;
}

export interface ListOptions {
  page?: number;
  perPage?: number;
  filter?: string;
  sort?: string;
  expand?: string;
  cache?: string; // 'none' to bypass cache
}

export interface ListResult {
  statusCode: number;
  message: string;
  data: any[];
  source: string;
  cacheKey: string;
  page?: number;
  perPage?: number;
  totalPages?: number;
  totalItems?: number;
}

@Injectable()
export class PocketBaseService {
  private pb: PocketBase;
  private readonly logger = new Logger(PocketBaseService.name);
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(private readonly redisService: RedisService) {
    this.pb = new PocketBase(process.env.POCKETBASE_URL || 'https://pocketbase.algoarena.co.in');
  }

  /**
   * Get all records from a collection with optional filtering and caching
   * @param collectionName - Name of the collection
   * @param options - List options including filter, sort, etc.
   * @param cachePrefix - Cache prefix for this collection
   * @param email - Optional email for filtering and cache key
   * @returns Promise<ListResult>
   */
  async getList(
    collectionName: string,
    options: ListOptions = {},
    cachePrefix: string,
    email?: string
  ): Promise<ListResult> {
    try {
      const cacheKey = `${cachePrefix}${email || 'all'}`;
      const { cache, ...listOptions } = options;
      const bypassCache = cache === 'none';
      
      // If cache=none is passed, delete existing cache and always fetch from database
      if (bypassCache) {
        this.logger.log(`Cache bypassed for ${collectionName} list (email: ${email || 'all'}), deleting existing cache and fetching from database`);
        
        // Delete existing cache if it exists
        await this.redisService.del(cacheKey);
        this.logger.log(`Deleted existing cache for key: ${cacheKey}`);
        
        const { page = 1, perPage = 50, filter = '', sort = '-created', expand = '' } = listOptions;
        
        // Add email filter if provided
        const finalFilter = email ? (filter ? `${filter} && email = '${email}'` : `email = '${email}'`) : filter;
        
        const result = await this.pb.collection(collectionName).getList(page, perPage, {
          filter: finalFilter,
          sort,
          expand,
        });
        
        const response = {
          statusCode: 200,
          message: result.items.length ? `${collectionName} retrieved successfully` : `No ${collectionName} found`,
          data: result.items,
          source: 'database (cache bypassed)',
          cacheKey,
          page: result.page,
          perPage: result.perPage,
          totalPages: result.totalPages,
          totalItems: result.totalItems,
        };

        // DO NOT cache when cache=none - always fetch fresh data
        this.logger.log(`Cache bypassed - not caching result for key: ${cacheKey}`);

        return response;
      }

      // Normal cache behavior - try to get from cache first
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        this.logger.log(`Cache hit for ${collectionName} list (email: ${email || 'all'})`);
        return {
          ...cachedData,
          source: 'cache',
          cacheKey,
        };
      }

      // If not in cache, get from database
      this.logger.log(`Cache miss for ${collectionName} list (email: ${email || 'all'}), fetching from database`);
      
      const { page = 1, perPage = 50, filter = '', sort = '-created', expand = '' } = listOptions;
      
      // Add email filter if provided
      const finalFilter = email ? (filter ? `${filter} && email = '${email}'` : `email = '${email}'`) : filter;
      
      const result = await this.pb.collection(collectionName).getList(page, perPage, {
        filter: finalFilter,
        sort,
        expand,
      });
      
      const response = {
        statusCode: 200,
        message: result.items.length ? `${collectionName} retrieved successfully` : `No ${collectionName} found`,
        data: result.items,
        source: 'database',
        cacheKey,
        page: result.page,
        perPage: result.perPage,
        totalPages: result.totalPages,
        totalItems: result.totalItems,
      };

      // Cache the result only for normal requests (not cache=none)
      await this.redisService.set(cacheKey, response, this.CACHE_TTL);
      this.logger.log(`Cached ${collectionName} list for key: ${cacheKey}`);

      return response;
    } catch (error) {
      this.logger.error(`Error listing ${collectionName}:`, error);
      throw new NotFoundException(`Failed to retrieve ${collectionName}. Please try again.`);
    }
  }

  /**
   * Get all records without pagination
   * @param collectionName - Name of the collection
   * @param options - List options
   * @param cachePrefix - Cache prefix
   * @param email - Optional email for filtering
   * @returns Promise<ListResult>
   */
  async getFullList(
    collectionName: string,
    options: ListOptions = {},
    cachePrefix: string,
    email?: string
  ): Promise<ListResult> {
    try {
      const cacheKey = `${cachePrefix}${email || 'all'}`;
      const { cache, ...listOptions } = options;
      const bypassCache = cache === 'none';
      
      // If cache=none is passed, delete existing cache and always fetch from database
      if (bypassCache) {
        this.logger.log(`Cache bypassed for ${collectionName} full list (email: ${email || 'all'}), deleting existing cache and fetching from database`);
        
        // Delete existing cache if it exists
        await this.redisService.del(cacheKey);
        this.logger.log(`Deleted existing cache for key: ${cacheKey}`);
        
        const { filter = '', sort = '-created', expand = '' } = listOptions;
        
        // Add email filter if provided
        const finalFilter = email ? (filter ? `${filter} && email = '${email}'` : `email = '${email}'`) : filter;
        
        const records = await this.pb.collection(collectionName).getFullList({
          filter: finalFilter,
          sort,
          expand,
        });
        
        const response = {
          statusCode: 200,
          message: records.length ? `${collectionName} retrieved successfully` : `No ${collectionName} found`,
          data: records,
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
        this.logger.log(`Cache hit for ${collectionName} full list (email: ${email || 'all'})`);
        return {
          ...cachedData,
          source: 'cache',
          cacheKey,
        };
      }

      // If not in cache, get from database
      this.logger.log(`Cache miss for ${collectionName} full list (email: ${email || 'all'}), fetching from database`);
      
      const { filter = '', sort = '-created', expand = '' } = listOptions;
      
      // Add email filter if provided
      const finalFilter = email ? (filter ? `${filter} && email = '${email}'` : `email = '${email}'`) : filter;
      
      const records = await this.pb.collection(collectionName).getFullList({
        filter: finalFilter,
        sort,
        expand,
      });
      
      const response = {
        statusCode: 200,
        message: records.length ? `${collectionName} retrieved successfully` : `No ${collectionName} found`,
        data: records,
        source: 'database',
        cacheKey,
      };

      // Cache the result only for normal requests (not cache=none)
      await this.redisService.set(cacheKey, response, this.CACHE_TTL);
      this.logger.log(`Cached ${collectionName} full list for key: ${cacheKey}`);

      return response;
    } catch (error) {
      this.logger.error(`Error listing ${collectionName}:`, error);
      throw new NotFoundException(`Failed to retrieve ${collectionName}. Please try again.`);
    }
  }

  /**
   * Get first record that matches the filter
   * @param collectionName - Name of the collection
   * @param filter - Filter string
   * @param options - Additional options
   * @returns Promise<PocketBaseRecord>
   */
  async getFirstListItem(
    collectionName: string,
    filter: string,
    options: { expand?: string; cache?: string } = {}
  ): Promise<PocketBaseRecord> {
    try {
      const { cache, ...otherOptions } = options;
      const bypassCache = cache === 'none';
      
      if (bypassCache) {
        this.logger.log(`Cache bypassed for first ${collectionName} item with filter: ${filter}`);
      }
      
      return await this.pb.collection(collectionName).getFirstListItem(filter, otherOptions);
    } catch (error) {
      this.logger.error(`Error getting first ${collectionName} item:`, error);
      throw new NotFoundException(`${collectionName} not found with the specified filter.`);
    }
  }

  /**
   * Get a single record by ID with caching
   * @param collectionName - Name of the collection
   * @param id - Record ID
   * @param cachePrefix - Cache prefix
   * @param options - Options including cache bypass
   * @returns Promise<PocketBaseRecord & { source: string }>
   */
  async getById(
    collectionName: string,
    id: string,
    cachePrefix: string,
    options: { cache?: string } = {}
  ): Promise<PocketBaseRecord & { source: string }> {
    try {
      const cacheKey = `${cachePrefix}${id}`;
      const { cache } = options;
      const bypassCache = cache === 'none';
      
      // If cache=none is passed, delete existing cache and always fetch from database
      if (bypassCache) {
        this.logger.log(`Cache bypassed for ${collectionName}: ${id}, deleting existing cache and fetching from database`);
        
        // Delete existing cache if it exists
        await this.redisService.del(cacheKey);
        this.logger.log(`Deleted existing cache for key: ${cacheKey}`);
        
        const record = await this.pb.collection(collectionName).getOne(id);
        
        // DO NOT cache when cache=none - always fetch fresh data
        this.logger.log(`Cache bypassed - not caching result for key: ${cacheKey}`);

        return {
          ...record,
          source: 'database (cache bypassed)',
        };
      }

      // Normal cache behavior - try to get from cache first
      const cachedRecord = await this.redisService.get(cacheKey);
      if (cachedRecord) {
        this.logger.log(`Cache hit for ${collectionName}: ${id}`);
        return {
          ...cachedRecord,
          source: 'cache',
        };
      }

      // If not in cache, get from database
      this.logger.log(`Cache miss for ${collectionName}: ${id}, fetching from database`);
      const record = await this.pb.collection(collectionName).getOne(id);
      
      // Cache the record only for normal requests (not cache=none)
      await this.redisService.set(cacheKey, record, this.CACHE_TTL);
      this.logger.log(`Cached ${collectionName} for key: ${cacheKey}`);

      return {
        ...record,
        source: 'database',
      };
    } catch (error) {
      this.logger.error(`Error getting ${collectionName} by ID ${id}:`, error);
      throw new NotFoundException(`${collectionName} not found with the specified ID.`);
    }
  }

  /**
   * Create a new record and invalidate related cache
   * @param collectionName - Name of the collection
   * @param data - Record data
   * @param cachePrefix - Cache prefix for invalidation
   * @returns Promise<PocketBaseRecord>
   */
  async create(
    collectionName: string,
    data: any,
    cachePrefix: string
  ): Promise<PocketBaseRecord> {
    try {
      const record = await this.pb.collection(collectionName).create(data);
      
      // Invalidate related caches
      if (data.email) {
        await this.invalidateCaches(cachePrefix, data.email);
      }
      
      this.logger.log(`${collectionName} created and cache invalidated for email: ${data.email || 'unknown'}`);
      return record;
    } catch (error) {
      this.logger.error(`Error creating ${collectionName}:`, error);
      throw new ConflictException(`Failed to create ${collectionName}. Please check your input data.`);
    }
  }

  /**
   * Update an existing record and invalidate related cache
   * @param collectionName - Name of the collection
   * @param id - Record ID
   * @param data - Updated record data
   * @param cachePrefix - Cache prefix for invalidation
   * @returns Promise<PocketBaseRecord>
   */
  async update(
    collectionName: string,
    id: string,
    data: any,
    cachePrefix: string
  ): Promise<PocketBaseRecord> {
    try {
      const updatedRecord = await this.pb.collection(collectionName).update(id, data);
      
      // Invalidate related caches
      if (data.email) {
        await this.invalidateCaches(cachePrefix, data.email);
      }
      
      this.logger.log(`${collectionName} updated and cache invalidated for email: ${data.email || 'unknown'}`);
      return updatedRecord;
    } catch (error) {
      throw new NotFoundException(`${collectionName} not found with the specified ID.`);
    }
  }

  /**
   * Delete a record by ID and invalidate related cache
   * @param collectionName - Name of the collection
   * @param id - Record ID
   * @param cachePrefix - Cache prefix for invalidation
   * @returns Promise<Object>
   */
  async delete(collectionName: string, id: string, cachePrefix: string) {
    try {
      // Get the record first to know which email to invalidate cache for
      const record = await this.pb.collection(collectionName).getOne(id);
      
      await this.pb.collection(collectionName).delete(id);
      
      // Invalidate related caches
      if (record.email) {
        await this.invalidateCaches(cachePrefix, record.email);
      }
      
      this.logger.log(`${collectionName} deleted and cache invalidated for email: ${record.email || 'unknown'}`);
      return {
        statusCode: 200,
        message: `${collectionName} deleted successfully`,
        data: { id }
      };
    } catch (error) {
      throw new NotFoundException(`${collectionName} not found with the specified ID.`);
    }
  }

  /**
   * Health check for database connection
   * @returns Promise<Object>
   */
  async healthCheck() {
    try {
      // Try to access the database
      await this.pb.collections.getFullList();
      return {
        status: 'healthy',
        message: 'Database connection is working',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Database connection failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Invalidate caches for a specific email
   * @param cachePrefix - Cache prefix
   * @param email - Email to invalidate cache for
   */
  private async invalidateCaches(cachePrefix: string, email: string) {
    try {
      const keysToDelete = [
        `${cachePrefix}${email}`,
        `${cachePrefix}all`,
      ];
      
      for (const key of keysToDelete) {
        await this.redisService.del(key);
        this.logger.log(`Invalidated cache key: ${key}`);
      }
    } catch (error) {
      this.logger.error('Error invalidating caches:', error);
    }
  }
} 
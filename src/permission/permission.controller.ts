import { Controller, Post, Body, Put, Delete, Get, Query, Param, BadRequestException, Res } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { Permission } from './permission.interface';
import { Response } from 'express';

/**
 * PermissionController handles all permission-related HTTP requests
 * Base route: /permissions
 */
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  /**
   * Health check endpoint with database and cache validation
   * Route: GET /permissions/health
   * @returns {Object} Health status of the API, database, and cache
   */
  @Get('health')
  async healthCheck() {
    return this.permissionService.healthCheck();
  }

  /**
   * Get all permissions with pagination
   * Route: GET /permissions/list?email={email}&page={page}&perPage={perPage}&cache={cache}
   * @param {string} email - Optional email to filter permissions
   * @param {number} page - Page number for pagination
   * @param {number} perPage - Items per page
   * @param {string} sort - Sort field
   * @param {string} filter - Additional filter
   * @param {string} cache - Cache control ('none' to bypass cache)
   * @param {Response} res - Express response object
   * @returns {Promise<Array>} List of permissions
   */
  @Get('list')
  async listPermissions(
    @Query('email') email: string,
    @Query('page') page: string,
    @Query('perPage') perPage: string,
    @Query('sort') sort: string,
    @Query('filter') filter: string,
    @Query('cache') cache: string,
    @Res() res: Response
  ) {
    const options = {
      page: page ? parseInt(page) : 1,
      perPage: perPage ? parseInt(perPage) : 50,
      sort: sort || '-created',
      filter: filter || '',
      cache: cache || undefined,
    };

    const result = await this.permissionService.listPermissions(email, options);
    res.setHeader('x-data-source', result.source || 'unknown');
    return res.json(result);
  }

  /**
   * Get all permissions without pagination
   * Route: GET /permissions/all?email={email}&cache={cache}
   * @param {string} email - Optional email to filter permissions
   * @param {string} sort - Sort field
   * @param {string} filter - Additional filter
   * @param {string} cache - Cache control ('none' to bypass cache)
   * @param {Response} res - Express response object
   * @returns {Promise<Array>} All permissions
   */
  @Get('all')
  async getAllPermissions(
    @Query('email') email: string,
    @Query('sort') sort: string,
    @Query('filter') filter: string,
    @Query('cache') cache: string,
    @Res() res: Response
  ) {
    const options = {
      sort: sort || '-created',
      filter: filter || '',
      cache: cache || undefined,
    };

    const result = await this.permissionService.getAllPermissions(email, options);
    res.setHeader('x-data-source', result.source || 'unknown');
    return res.json(result);
  }

  /**
   * Get all modules listing
   * Route: GET /permissions/modules?cache={cache}
   * @param {string} sort - Sort field
   * @param {string} filter - Additional filter
   * @param {string} cache - Cache control ('none' to bypass cache)
   * @param {Response} res - Express response object
   * @returns {Promise<Array>} All modules
   */
  @Get('modules')
  async getModulesList(
    @Query('sort') sort: string,
    @Query('filter') filter: string,
    @Query('cache') cache: string,
    @Res() res: Response
  ) {
    const options = {
      sort: sort || '-created',
      filter: filter || '',
      cache: cache || undefined,
    };

    const result = await this.permissionService.getModulesList(options);
    res.setHeader('x-data-source', result.source || 'unknown');
    return res.json(result);
  }

  /**
   * Get a single permission by ID
   * Route: GET /permissions/:id?cache={cache}
   * @param {string} id - Permission ID
   * @param {string} cache - Cache control ('none' to bypass cache)
   * @returns {Promise<Permission>} Permission data
   */
  @Get(':id')
  async getPermissionById(
    @Param('id') id: string,
    @Query('cache') cache: string
  ) {
    if (!id) {
      throw new BadRequestException('Permission ID is required');
    }
    const options = {
      cache: cache || undefined,
    };
    return this.permissionService.getPermissionById(id, options);
  }

  /**
   * Get first permission that matches the filter
   * Route: GET /permissions/first?filter={filter}&cache={cache}
   * @param {string} filter - Filter string
   * @param {string} expand - Expand fields
   * @param {string} cache - Cache control ('none' to bypass cache)
   * @returns {Promise<Permission>} Permission data
   */
  @Get('first')
  async getFirstPermission(
    @Query('filter') filter: string,
    @Query('expand') expand: string,
    @Query('cache') cache: string
  ) {
    if (!filter) {
      throw new BadRequestException('Filter is required');
    }
    const options = {
      expand: expand || undefined,
      cache: cache || undefined,
    };
    return this.permissionService.getFirstPermission(filter, options);
  }

  /**
   * Create a new permission
   * Route: POST /permissions/create
   * @param {Permission} body - Permission data
   * @returns {Promise<Permission>} Created permission
   */
  @Post('create')
  async createPermission(@Body() body: Permission): Promise<Permission> {
    // Validate required fields
    if (!body.email) {
      throw new BadRequestException('Email is required');
    }
    if (!body.modules) {
      throw new BadRequestException('Modules is required');
    }
    if (!body.permissions) {
      throw new BadRequestException('Permissions is required');
    }
    if (!body.updated_by) {
      throw new BadRequestException('Updated by is required');
    }

    return this.permissionService.createPermission(body);
  }

  /**
   * Update an existing permission
   * Route: PUT /permissions/update
   * @param {Permission} body - Updated permission data
   * @returns {Promise<Permission>} Updated permission
   */
  @Put('update')
  async updatePermission(@Body() body: Permission): Promise<Permission> {
    if (!body.id) {
      throw new BadRequestException('Permission ID is required for update');
    }
    return this.permissionService.updatePermission(body.id, body);
  }

  /**
   * Delete a permission by ID
   * Route: DELETE /permissions/delete
   * @param {Object} body - Contains permission ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  @Delete('delete')
  async deletePermission(@Body() body: { id: string }) {
    if (!body.id) {
      throw new BadRequestException('Permission ID is required for deletion');
    }
    return this.permissionService.deletePermission(body.id);
  }
} 
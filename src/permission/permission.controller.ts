import { Controller, Get, Query, BadRequestException, Res } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { Response } from 'express';

/**
 * PermissionController handles permission-related HTTP requests
 * Base route: /permissions
 */
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  /**
   * Get the latest permission by email
   * Route: GET /permissions?email={email}&cache={cache}
   * @param {string} email - Email to filter permissions
   * @param {string} cache - Cache control ('none' to bypass cache)
   * @param {Response} res - Express response object
   * @returns {Promise<Object>} Latest permission data
   */
  @Get()
  async getLatestPermission(
    @Query('email') email: string,
    @Query('cache') cache: string,
    @Res() res: Response
  ) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const options = {
      cache: cache || undefined,
    };

    const result = await this.permissionService.getLatestPermission(email, options);
    res.setHeader('x-data-source', result.source || 'unknown');
    return res.json(result);
  }
} 
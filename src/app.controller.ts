import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Server is running',
      version: '1.0.0'
    };
  }

  @Get('test')
  testRoute() {
    return {
      status: 'success',
      message: 'Test route is working!',
      timestamp: new Date().toISOString(),
      endpoints: {
        tasks: {
          list: '/list',
          create: 'create',
          update: '/update',
          remove: '/remove',
          health: '/health'
        }
      }
    };
  }
}

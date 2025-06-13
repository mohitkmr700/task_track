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
}

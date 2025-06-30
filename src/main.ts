import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Bootstrap the NestJS application
 * Creates and configures the NestJS application instance
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  logger.log('🚀 Starting NestJS application...');
  
  // Create NestJS application instance
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with specific configuration
  app.enableCors({
    origin: [
      'http://localhost:4000',
      process.env.ALLOWED_ORIGIN || 'https://algoarena.co.in'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  
  // Get port from environment variables or use default
  const port = process.env.PORT || 3001;
  
  // Start the application
  await app.listen(port);
  
  logger.log('✅ Application started successfully!');
  logger.log(`🌐 Server running on: http://localhost:${port}`);
  logger.log(`🏥 Health check available at: http://localhost:${port}/health`);
  logger.log('📊 Redis status will be shown above if working.');
}

// Start the application
bootstrap();

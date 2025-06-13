import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Bootstrap the NestJS application
 * Creates and configures the NestJS application instance
 */
async function bootstrap() {
  // Create NestJS application instance
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with specific configuration
  app.enableCors({
    origin: ['http://localhost:4000', 'https://algoarena.co.in'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  
  // Get port from environment variables or use default
  const port = process.env.PORT || 3001;
  
  // Start the application
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

// Start the application
bootstrap();

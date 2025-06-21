<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Task Track - NestJS + PocketBase + Redis

<!-- Last updated: $(date) -->

## Features

- **NestJS** (TypeScript) backend
- **PocketBase** as the database
- **Redis** for caching and performance optimization
- **Health checks** for both database and cache
- **Cache validation** to distinguish between cached and database responses

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following content:
   ```
   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   REDIS_DB=0

   # PocketBase Configuration
   POCKETBASE_URL=your_pocketbase_url_here

   # Application Configuration
   NODE_ENV=development
   ```

3. Start Redis server (if not already running):
   ```bash
   # macOS with Homebrew
   brew install redis
   brew services start redis

   # Ubuntu/Debian
   sudo apt-get install redis-server
   sudo systemctl start redis-server

   # Windows
   # Download and install Redis from https://redis.io/download
   ```

4. Test Redis connection:
   ```bash
   npm run test:redis
   ```

5. Start the NestJS server with Redis:
   ```bash
   npm run start:redis
   ```

## Redis Integration

### Connection Logs
When you start the application, you'll see Redis connection logs:
- ✅ **Redis connected successfully** - Redis is connected
- 🚀 **Redis is ready to accept commands** - Redis is ready
- ❌ **Redis connection error** - Connection failed
- 🔌 **Redis connection closed** - Connection closed
- 🔄 **Redis reconnecting** - Attempting to reconnect

### Health Check
Test Redis connectivity using the health check endpoint:
```bash
curl http://localhost:3000/health
```

Response includes both database and cache health:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": {
    "status": "healthy",
    "message": "Database is responding (45ms)",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "cache": {
    "status": "healthy",
    "message": "Redis is responding (2ms)",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "overall": "healthy"
}
```

### Caching Features
- **Task List Caching**: Tasks are cached for 5 minutes
- **Individual Task Caching**: Single tasks are cached for 5 minutes
- **Cache Invalidation**: Cache is automatically invalidated when tasks are created, updated, or deleted
- **Cache Validation**: All responses include source information (`"source": "cache"` or `"source": "database"`)

## Project Structure

```
src/
├── config/
│   └── redis.config.ts          # Redis configuration with validation
├── modules/
│   └── redis.module.ts          # Redis module (global)
├── providers/
│   └── redis.provider.ts        # Redis provider with connection events
├── services/
│   └── redis.service.ts         # Redis service with caching operations
├── task/
│   ├── task.controller.ts       # Task endpoints with health check
│   ├── task.service.ts          # Task service with Redis caching
│   ├── task.module.ts           # Task module
│   └── task.interface.ts        # Task interface
└── app.module.ts                # Main app module with ConfigModule
```

## API Endpoints

### Health Check
- **GET** `/health` - Check database and cache health

### List Tasks
- **GET** `/list=all?email=example@example.com`
  - Returns a list of tasks for the specified email (cached for 5 minutes)
  - Response includes cache information and source

### Get Single Task
- **GET** `/task/:id`
  - Returns a single task by ID (cached for 5 minutes)
  - Response includes cache information and source

### Create Task
- **POST** `/create-api`
  - Creates a new task and invalidates related caches
  - Example request:
    ```json
    {
      "title": "test",
      "description": "test",
      "progress": 123,
      "deadline": "2022-01-01 10:00:00.123Z",
      "is_done": true,
      "completed_at": "2022-01-01 10:00:00.123Z",
      "email": "test@example.com"
    }
    ```

### Update Task
- **PUT** `/update`
  - Updates a task and invalidates related caches
  - Example request:
    ```json
    {
      "id": "task_id",
      "title": "Updated Task",
      "description": "Updated Description",
      "progress": 456,
      "deadline": "2022-01-01 10:00:00.123Z",
      "is_done": false,
      "completed_at": "2022-01-01 10:00:00.123Z",
      "email": "test@example.com"
    }
    ```

### Delete Task
- **DELETE** `/remove`
  - Deletes a task and invalidates related caches
  - Example request:
    ```json
    {
      "id": "task_id"
    }
    ```

## Available Scripts

```bash
# Development
npm run start:dev          # Start in development mode
npm run start:redis        # Start with Redis logging
npm run start:debug        # Start in debug mode

# Testing
npm run test:redis         # Test Redis connection
npm run test               # Run unit tests
npm run test:e2e           # Run e2e tests

# Build
npm run build              # Build the application
npm run start:prod         # Start in production mode
```

## Error Handling

- **404 Not Found**: Returned when no tasks are found for the specified email or ID
- **409 Conflict**: Returned when attempting to create a task with a title that already exists
- **Redis Connection Errors**: Logged to console with detailed error information

## Performance Monitoring

- Cache hits are logged as: `Cache hit for tasks list (email: user@example.com)`
- Cache misses are logged as: `Cache miss for tasks list (email: user@example.com), fetching from database`
- Cache operations are logged with debug level
- Health check endpoint provides response times for both database and cache

## Troubleshooting

### Redis Connection Issues
1. Ensure Redis server is running
2. Check `REDIS_HOST` and `REDIS_PORT` in environment
3. Verify Redis server is accessible from your application
4. Use `npm run test:redis` to test connectivity

### Cache Issues
1. Check Redis logs in console output
2. Use health check endpoint to verify connectivity
3. Monitor cache hit/miss logs in application logs

For detailed Redis setup instructions, see [REDIS_SETUP.md](./REDIS_SETUP.md).

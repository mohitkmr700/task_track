# User Service API

A NestJS-based microservice that provides CRUD operations for tasks and permissions using PocketBase as the database and Redis for caching.

## Features

- **Common PocketBase Service**: Reusable service for all PocketBase operations
- **Redis Caching**: Automatic caching with configurable TTL
- **Cache Bypass**: Force database fetch with `cache=none` parameter
- **CRUD Operations**: Create, Read, Update, Delete for tasks and permissions
- **Health Checks**: Database and cache health monitoring
- **Pagination Support**: Both paginated and full list endpoints
- **Filtering**: Email-based filtering and custom filters
- **Sorting**: Configurable sorting options

## Project Structure

```
user_service/
├── src/
│   ├── services/
│   │   ├── pocketbase.service.ts    # Common PocketBase service
│   │   ├── redis.service.ts         # Redis service
│   │   └── startup.service.ts       # Startup service
│   ├── task/
│   │   ├── task.controller.ts       # Task endpoints
│   │   ├── task.service.ts          # Task business logic
│   │   ├── task.module.ts           # Task module
│   │   └── task.interface.ts        # Task data structure
│   ├── permission/
│   │   ├── permission.controller.ts # Permission endpoints
│   │   ├── permission.service.ts    # Permission business logic
│   │   ├── permission.module.ts     # Permission module
│   │   └── permission.interface.ts  # Permission data structure
│   ├── modules/
│   │   └── redis.module.ts          # Redis module
│   ├── providers/
│   │   └── redis.provider.ts        # Redis provider
│   ├── config/
│   │   └── redis.config.ts          # Redis configuration
│   ├── app.controller.ts            # Main app controller
│   ├── app.module.ts                # Main app module
│   └── main.ts                      # Application entry point
├── package.json
└── README.md                        # This file
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# PocketBase Configuration
POCKETBASE_URL=https://pocketbase.algoarena.co.in

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Application Configuration
PORT=3000
NODE_ENV=development
```

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

## API Endpoints

### Base URL
```
http://localhost:3000
```

## Task Module

### Health Check
```
GET /health
```
Returns health status of database and cache.

### List Tasks
```
GET /list=all?email={email}&cache={cache}
```
- `email` (optional): Filter by email
- `cache` (optional): Cache control - use 'none' to bypass cache

### Get Task by ID
```
GET /task/{id}?cache={cache}
```
Returns a single task by ID.

### Create Task
```
POST /create-api
```
Body:
```json
{
  "email": "user@example.com",
  "title": "Task Title",
  "description": "Task Description",
  "progress": 50,
  "deadline": "2024-12-31T23:59:59.000Z",
  "is_done": false
}
```

### Update Task
```
PUT /update
```
Body:
```json
{
  "id": "RECORD_ID",
  "email": "user@example.com",
  "title": "Updated Task Title",
  "description": "Updated Task Description",
  "progress": 75,
  "deadline": "2024-12-31T23:59:59.000Z",
  "is_done": true
}
```

### Delete Task
```
DELETE /remove
```
Body:
```json
{
  "id": "RECORD_ID"
}
```

## Permission Module

### Health Check
```
GET /permissions/health
```
Returns health status of database and cache.

### List Permissions (Paginated)
```
GET /permissions/list?email={email}&page={page}&perPage={perPage}&sort={sort}&filter={filter}&cache={cache}
```
- `email` (optional): Filter by email
- `page` (optional): Page number (default: 1)
- `perPage` (optional): Items per page (default: 50)
- `sort` (optional): Sort field (default: '-created')
- `filter` (optional): Additional filter string
- `cache` (optional): Cache control - use 'none' to bypass cache

### Get All Permissions
```
GET /permissions/all?email={email}&sort={sort}&filter={filter}&cache={cache}
```
Returns all permissions without pagination.

### Get Modules List
```
GET /permissions/modules?sort={sort}&filter={filter}&cache={cache}
```
Returns all modules from the control system.

### Get Permission by ID
```
GET /permissions/{id}?cache={cache}
```
Returns a single permission by ID.

### Get First Permission
```
GET /permissions/first?filter={filter}&expand={expand}&cache={cache}
```
Returns the first permission that matches the filter.

### Create Permission
```
POST /permissions/create
```
Body:
```json
{
  "email": "user@example.com",
  "modules": "{\"module1\": true, \"module2\": false}",
  "permissions": "{\"read\": true, \"write\": false}",
  "updated_by": "admin@example.com"
}
```

### Update Permission
```
PUT /permissions/update
```
Body:
```json
{
  "id": "RECORD_ID",
  "email": "user@example.com",
  "modules": "{\"module1\": true, \"module2\": true}",
  "permissions": "{\"read\": true, \"write\": true}",
  "updated_by": "admin@example.com"
}
```

### Delete Permission
```
DELETE /permissions/delete
```
Body:
```json
{
  "id": "RECORD_ID"
}
```

## Cache Control

### Normal Cache Behavior
By default, all GET requests use Redis caching:
- First request: Fetches from database and caches the result
- Subsequent requests: Returns cached data (if available)
- Cache TTL: 5 minutes

### Bypass Cache
Use `cache=none` parameter to force database fetch:
```
GET /list=all?email=test@example.com&cache=none
```

**What happens with `cache=none`:**
1. Bypasses existing cache
2. Fetches fresh data from database
3. Updates cache with new data
4. Returns fresh data with source: "database (cache bypassed)"

**Use cases:**
- Force refresh when you know data has changed
- Debugging cache issues
- Ensuring data consistency
- Real-time data requirements

## Data Structures

### Task Interface
```typescript
interface Task {
  id?: string;
  title?: string;
  description?: string;
  progress?: number;
  deadline?: string;
  is_done?: boolean;
  completed_at?: string;
  email?: string;
  created?: string;
  updated?: string;
  collectionId?: string;
  collectionName?: string;
}
```

### Permission Interface
```typescript
interface Permission {
  id?: string;
  modules?: string; // JSON string
  permissions?: string; // JSON string
  updated_by?: string;
  email?: string;
  created?: string;
  updated?: string;
  collectionId?: string;
  collectionName?: string;
}
```

## Common PocketBase Service

The application uses a common `PocketBaseService` that provides:

- **Dynamic Collection Support**: Works with any PocketBase collection
- **Caching**: Automatic Redis caching with invalidation
- **Cache Bypass**: Force database fetch with cache refresh
- **Error Handling**: Consistent error handling across all operations
- **Health Monitoring**: Database connection health checks
- **Flexible Filtering**: Support for complex filters and sorting

### Usage in New Modules

To create a new module using the common PocketBase service:

```typescript
import { PocketBaseService } from '../services/pocketbase.service';

@Injectable()
export class YourService {
  constructor(private readonly pocketBaseService: PocketBaseService) {}

  async getData() {
    return this.pocketBaseService.getList(
      'your_collection',
      { page: 1, perPage: 50, cache: 'none' },
      'your_cache_prefix:',
      'user@example.com'
    );
  }
}
```

## Caching

The application uses Redis for caching with:
- **TTL**: 5 minutes for most operations
- **Cache Keys**: Prefixed with module name for easy management
- **Invalidation**: Automatic cache invalidation on create/update/delete operations
- **Cache Headers**: Response includes `x-data-source` header indicating cache status
- **Cache Bypass**: Use `cache=none` parameter to force database fetch and refresh cache

## Response Headers

All GET endpoints include:
- `x-data-source`: Indicates data source
  - `cache`: Data came from Redis cache
  - `database`: Data came from database
  - `database (cache bypassed)`: Data came from database due to cache bypass

## Example Usage

### Task Operations

#### Get Tasks with Cache
```bash
curl -X GET "http://localhost:3000/list=all?email=test@example.com" \
  -H "Content-Type: application/json"
```

#### Get Tasks Bypassing Cache
```bash
curl -X GET "http://localhost:3000/list=all?email=test@example.com&cache=none" \
  -H "Content-Type: application/json"
```

#### Get Task by ID
```bash
curl -X GET "http://localhost:3000/task/RECORD_ID?cache=none" \
  -H "Content-Type: application/json"
```

#### Create Task
```bash
curl -X POST "http://localhost:3000/create-api" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "title": "New Task",
    "description": "Task description",
    "progress": 0,
    "is_done": false
  }'
```

### Permission Operations

#### Get All Permissions for Email
```bash
curl -X GET "http://localhost:3000/permissions/all?email=test@example.com" \
  -H "Content-Type: application/json"
```

#### Get All Permissions (Bypass Cache)
```bash
curl -X GET "http://localhost:3000/permissions/all?email=test@example.com&cache=none" \
  -H "Content-Type: application/json"
```

#### Get Modules List
```bash
curl -X GET "http://localhost:3000/permissions/modules" \
  -H "Content-Type: application/json"
```

#### Create Permission
```bash
curl -X POST "http://localhost:3000/permissions/create" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "modules": "{\"dashboard\": true, \"users\": false}",
    "permissions": "{\"read\": true, \"write\": false}",
    "updated_by": "admin@example.com"
  }'
```

## Health Checks

### Application Health
```bash
curl -X GET "http://localhost:3000/health"
```

### Task Module Health
```bash
curl -X GET "http://localhost:3000/health"
```

### Permission Module Health
```bash
curl -X GET "http://localhost:3000/permissions/health"
```

## Development

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Linting
```bash
# Lint
npm run lint

# Lint and fix
npm run lint:fix
```

## Production Deployment

### Build
```bash
npm run build
```

### Start Production Server
```bash
npm run start:prod
```

### Using PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs
```

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Check Redis server is running
   - Verify Redis configuration in `.env`
   - Check Redis host and port

2. **PocketBase Connection Failed**
   - Verify `POCKETBASE_URL` in `.env`
   - Check PocketBase server is accessible
   - Verify network connectivity

3. **Cache Not Working**
   - Check Redis connection
   - Verify cache TTL settings
   - Use `cache=none` to bypass cache for testing

4. **Data Not Updating**
   - Check if cache invalidation is working
   - Use `cache=none` to force database fetch
   - Verify PocketBase collection permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

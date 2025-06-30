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
- **Environment-based Configuration**: Secure configuration management

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
├── .github/
│   └── workflows/
│       └── deploy.yml               # CI/CD deployment workflow
├── ecosystem.config.js              # PM2 configuration
├── package.json
└── README.md                        # This file
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Required Environment Variables

```env
# PocketBase Configuration
POCKETBASE_URL=https://your-pocketbase-instance.com

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Application Configuration
PORT=3001
NODE_ENV=development
```

### Optional Environment Variables

```env
# Redis Advanced Configuration
REDIS_RETRY_DELAY_ON_FAILOVER=100
REDIS_MAX_RETRIES_PER_REQUEST=3
REDIS_CONNECT_TIMEOUT=10000
REDIS_LAZY_CONNECT=true

# PocketBase Admin Credentials (for advanced operations)
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=your_admin_password
```

### Environment Variable Details

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POCKETBASE_URL` | Yes | - | PocketBase server URL |
| `REDIS_HOST` | Yes | `localhost` | Redis server host |
| `REDIS_PORT` | Yes | `6379` | Redis server port |
| `REDIS_PASSWORD` | Yes | - | Redis authentication password |
| `REDIS_DB` | No | `0` | Redis database number |
| `PORT` | No | `3001` | Application port |
| `NODE_ENV` | No | `development` | Node environment |
| `REDIS_RETRY_DELAY_ON_FAILOVER` | No | `100` | Redis retry delay in ms |
| `REDIS_MAX_RETRIES_PER_REQUEST` | No | `3` | Max Redis retries per request |
| `REDIS_CONNECT_TIMEOUT` | No | `10000` | Redis connection timeout in ms |
| `REDIS_LAZY_CONNECT` | No | `true` | Enable lazy Redis connection |
| `POCKETBASE_ADMIN_EMAIL` | No | - | PocketBase admin email |
| `POCKETBASE_ADMIN_PASSWORD` | No | - | PocketBase admin password |

### Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env` files** to version control
2. **Use strong passwords** for Redis and PocketBase
3. **Use HTTPS** for PocketBase URL in production
4. **Restrict Redis access** to application servers only
5. **Use environment-specific** configuration files

### Example `.env` File

```env
# Development Environment
NODE_ENV=development
PORT=3001

# PocketBase Configuration
POCKETBASE_URL=https://pocketbase.algoarena.co.in

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_redis_password
REDIS_DB=0

# Optional: Advanced Redis Settings
REDIS_RETRY_DELAY_ON_FAILOVER=100
REDIS_MAX_RETRIES_PER_REQUEST=3
REDIS_CONNECT_TIMEOUT=10000
REDIS_LAZY_CONNECT=true

# Optional: PocketBase Admin (for advanced operations)
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=your_secure_admin_password
```

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd user_service

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

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
http://localhost:3001
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
curl -X GET "http://localhost:3001/list=all?email=test@example.com" \
  -H "Content-Type: application/json"
```

#### Get Tasks Bypassing Cache
```bash
curl -X GET "http://localhost:3001/list=all?email=test@example.com&cache=none" \
  -H "Content-Type: application/json"
```

#### Get Task by ID
```bash
curl -X GET "http://localhost:3001/task/RECORD_ID?cache=none" \
  -H "Content-Type: application/json"
```

#### Create Task
```bash
curl -X POST "http://localhost:3001/create-api" \
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
curl -X GET "http://localhost:3001/permissions/all?email=test@example.com" \
  -H "Content-Type: application/json"
```

#### Get All Permissions (Bypass Cache)
```bash
curl -X GET "http://localhost:3001/permissions/all?email=test@example.com&cache=none" \
  -H "Content-Type: application/json"
```

#### Get Modules List
```bash
curl -X GET "http://localhost:3001/permissions/modules" \
  -H "Content-Type: application/json"
```

#### Create Permission
```bash
curl -X POST "http://localhost:3001/permissions/create" \
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
curl -X GET "http://localhost:3001/health"
```

### Task Module Health
```bash
curl -X GET "http://localhost:3001/health"
```

### Permission Module Health
```bash
curl -X GET "http://localhost:3001/permissions/health"
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

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY ecosystem.config.js ./

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
```

## CI/CD Pipeline

The project includes a GitHub Actions workflow for automated deployment:

- **Trigger**: Push to `main` branch
- **Deployment**: Automated deployment to EC2 instance
- **Environment**: Uses GitHub Secrets for secure configuration
- **Process**: Build → Deploy → Restart PM2

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `DEPLOY_KEY` | SSH private key for EC2 access |
| `DEPLOY_HOST` | EC2 instance IP/hostname |
| `DEPLOY_USER` | SSH username for EC2 |
| `REDIS_HOST` | Redis server host |
| `REDIS_PORT` | Redis server port |
| `REDIS_PASSWORD` | Redis authentication password |
| `POCKETBASE_URL` | PocketBase server URL |
| `POCKETBASE_ADMIN_EMAIL` | PocketBase admin email |
| `POCKETBASE_ADMIN_PASSWORD` | PocketBase admin password |
| `PORT` | Application port |

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Check Redis server is running
   - Verify Redis configuration in `.env`
   - Check Redis host and port
   - Ensure Redis password is correct

2. **PocketBase Connection Failed**
   - Verify `POCKETBASE_URL` in `.env`
   - Check PocketBase server is accessible
   - Verify network connectivity
   - Check SSL certificate if using HTTPS

3. **Cache Not Working**
   - Check Redis connection
   - Verify cache TTL settings
   - Use `cache=none` to bypass cache for testing
   - Check Redis memory usage

4. **Data Not Updating**
   - Check if cache invalidation is working
   - Use `cache=none` to force database fetch
   - Verify PocketBase collection permissions
   - Check PocketBase admin credentials

5. **Environment Variables Not Loading**
   - Ensure `.env` file exists in root directory
   - Check variable names match exactly
   - Restart application after changing `.env`
   - Verify no spaces around `=` in `.env`

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

### Health Check Endpoints

Use health check endpoints to verify service status:

```bash
# Application health
curl http://localhost:3001/health

# Permission module health
curl http://localhost:3001/permissions/health
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add proper error handling
- Include JSDoc comments for new functions
- Update README.md for new features
- Test your changes thoroughly

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation
- Contact the development team

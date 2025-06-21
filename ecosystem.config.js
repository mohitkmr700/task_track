module.exports = {
  apps: [{
    name: 'user-service',
    script: 'dist/main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      REDIS_HOST: process.env.REDIS_HOST || 'localhost',
      REDIS_PORT: process.env.REDIS_PORT || 6379,
      REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
      POCKETBASE_ADMIN_EMAIL: process.env.POCKETBASE_ADMIN_EMAIL || '',
      POCKETBASE_ADMIN_PASSWORD: process.env.POCKETBASE_ADMIN_PASSWORD || '',
      POCKETBASE_URL: process.env.POCKETBASE_URL || 'http://algoarena.co.in/pocketbase',
      PORT: process.env.PORT || 3001
    }
  }]
};

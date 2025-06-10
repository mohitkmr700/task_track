module.exports = {
  apps: [
    {
      name: 'task-backend',
      script: 'dist/main.js',
      env: {
        PORT: 3001,
        NODE_ENV: 'production'  // optional, set your environment
      }
    }
  ]
};

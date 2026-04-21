module.exports = {
  apps: [
    {
      name: 'ticket-server',
      script: 'server.js', // Standalone 模式下的启动入口
      env: {
        NODE_ENV: 'production',
        PORT: 3000, // 你的应用端口
      },
    },
  ],
};
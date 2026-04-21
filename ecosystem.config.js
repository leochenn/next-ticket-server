module.exports = {
  apps: [
    {
      name: 'ticket-server2',
      script: './standalone/server.js', // Standalone 模式下的启动入口
      env: {
        NODE_ENV: 'production',
        PORT: 3001, // 你的应用端口
      },
    },
  ],
};
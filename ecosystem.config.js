module.exports = {
  apps: [
    {
      name: 'ticket-server2',
      cwd: './standalone',
      script: './server.js', // 必须在 standalone 目录下运行，否则找不到 .next 目录
      env: {
        NODE_ENV: 'production',
        PORT: 3001, // 你的应用端口
      },
    },
  ],
};
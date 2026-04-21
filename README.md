# ticket-server（Next.js 管理端）

本项目是一个基于 Next.js（App Router）的轻量管理端，用于：

- 提供一个可由外部插件调用的状态接口（用于可用性校验）
- 接收并落盘保存插件上报的日志（配置导入摘要 / 每轮执行结果）
- 提供后台页面：状态控制、日志查看、统计信息

默认以子路径方式部署：`/ticket`（见 `next.config.js` 的 `basePath`）。

## 运行与部署

### 1) 本地开发

```bash
npm install
npm run dev
```

默认访问：

- `http://localhost:3000/ticket`

### 2) 生产构建

```bash
npm install
npm run build
npm run start
```

如需通过 Nginx 反向代理到 `http://127.0.0.1:3000`，请确保外部访问路径带上 `/ticket`。

## 数据落盘位置

运行目录下会生成：

- `data/status.json`：状态开关
- `data/logs/YYYY-MM-DD.json`：按天保存的日志数组（包含配置/结果两类）

## 对外接口（给插件调用）

注意：因为 `basePath=/ticket`，所以下文所有接口都建议以 `https://你的域名/ticket` 作为基地址。

### 1) 查询状态

`GET /api/status`

示例：

```bash
curl -s https://你的域名/ticket/api/status
```

响应：

```json
{
  "enabled": true,
  "message": "抢票功能已启用"
}
```

### 2) 设置状态

`POST /api/status`

请求体：

```json
{ "enabled": true }
```

示例：

```bash
curl -s -X POST https://你的域名/ticket/api/status ^
  -H "Content-Type: application/json" ^
  -d "{\"enabled\":true}"
```

响应：

```json
{ "success": true, "message": "抢票功能已启用" }
```

### 3) 上报配置导入摘要日志

`POST /api/logs/config`

请求体（字段含义以插件侧生成的 payload 为准）：

```json
{
  "pluginId": "kehpbdebndclddimkbakhekekjemjllp",
  "timestamp": "2026-04-21T02:24:17.000Z",
  "taskPlan": { "taskCount": 4, "groupCount": 4, "guideCount": 0, "mode": "folder" },
  "ticketTypes": [{ "name": "xx", "count": 2 }],
  "fileGroups": [{ "fileName": "a.xls", "peopleCount": 34 }],
  "guideAssignments": [{ "guideName": "张三", "groupCount": 2, "peopleCount": 34 }]
}
```

响应：

```json
{ "success": true, "message": "配置日志已保存" }
```

### 4) 上报每轮结果日志

`POST /api/logs/result`

请求体（字段含义以插件侧生成的 payload 为准）：

```json
{
  "pluginId": "kehpbdebndclddimkbakhekekjemjllp",
  "timestamp": "2026-04-21T02:25:00.000Z",
  "roundInfo": {
    "roundNumber": 1,
    "date": "2026-04-21",
    "startTime": "2026-04-21T02:24:30.000Z",
    "endTime": "2026-04-21T02:25:00.000Z",
    "mode": "tasks",
    "status": "allDone"
  },
  "tasks": [
    {
      "status": "成功",
      "successTime": "2026-04-21T02:24:45.000Z",
      "guide": "张三",
      "group": 1,
      "ticketType": "xx",
      "peopleCount": 10,
      "tourists": "A~B"
    }
  ]
}
```

响应：

```json
{ "success": true, "message": "抢票结果日志已保存" }
```

### 5) 查询某天日志（后台页面也使用这个接口）

`GET /api/logs?date=YYYY-MM-DD&page=1&pageSize=100`

示例：

```bash
curl -s "https://你的域名/ticket/api/logs?date=2026-04-21&page=1&pageSize=100"
```

响应：

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "config_1713660000000_xxxxxxx",
        "type": "config",
        "pluginId": "kehpbdebndclddimkbakhekekjemjllp",
        "timestamp": "2026-04-21T02:24:17.000Z",
        "data": {}
      }
    ],
    "total": 1,
    "hasMore": false
  }
}
```

### 6) 查询统计信息

`GET /api/stats`

示例：

```bash
curl -s https://你的域名/ticket/api/stats
```

响应：

```json
{
  "success": true,
  "data": {
    "totalPlugins": 1,
    "activePlugins": ["kehpbdebndclddimkbakhekekjemjllp"],
    "totalLogs": 10,
    "todayLogs": 3
  }
}
```

## 访问后台页面

- 状态控制：`/ticket/`
- 日志查看：`/ticket/logs`
- 统计信息：`/ticket/stats`

## 安全提示

当前接口未内置鉴权。建议至少通过以下方式做保护：

- 仅内网访问或通过防火墙限制访问源
- Nginx 增加 Basic Auth / IP 白名单


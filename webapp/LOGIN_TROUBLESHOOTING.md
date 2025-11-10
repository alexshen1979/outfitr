# 登录问题排查指南

## 问题：登录失败 - "无法连接到服务器"

### 原因
后端服务器（Backend Server）没有运行，导致前端无法连接到 API。

### 解决方案

#### 方法1：使用启动脚本（推荐）

在项目根目录运行：

```bash
cd webapp
start-all.bat
```

这会同时启动前端和后端服务器。

#### 方法2：手动启动后端服务器

1. 打开新的终端窗口
2. 进入后端目录：
   ```bash
   cd webapp/backend
   ```
3. 启动服务器：
   ```bash
   npm run dev
   ```

#### 方法3：使用后端启动脚本

直接运行：
```bash
webapp/backend/start-backend.bat
```

### 验证后端是否运行

打开浏览器访问：http://localhost:3001/health

如果看到 `{"status":"ok","message":"OUTFITR Backend API is running"}`，说明后端已成功启动。

### 常见问题

1. **端口被占用**
   - 如果 3001 端口被占用，修改 `webapp/backend/.env` 中的 `PORT` 值
   - 同时修改 `webapp/frontend/.env.local` 中的 `NEXT_PUBLIC_API_URL`

2. **数据库连接失败**
   - 检查 `webapp/backend/.env` 中的数据库配置
   - 确保 MySQL 服务器正在运行
   - 确保数据库 `dev_outfitr` 已创建

3. **依赖未安装**
   - 在 `webapp/backend` 目录运行 `npm install`

### 登录测试

后端启动后，使用以下测试账号登录：
- 邮箱：`test2@example.com`
- 密码：`password123`

或者注册新账号进行测试。


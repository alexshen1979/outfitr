# 注册功能故障排查指南

## 常见问题及解决方案

### 1. 数据库连接失败

**症状**: 错误信息包含 "Database connection failed" 或 "ECONNREFUSED"

**解决方案**:
1. 确保MySQL服务正在运行
2. 检查 `webapp/backend/.env` 文件中的数据库配置：
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your-password
   DB_NAME=outfitr
   ```
3. 测试数据库连接：
   ```bash
   mysql -u root -p -e "SELECT 1"
   ```

### 2. 数据库表不存在

**症状**: 错误信息包含 "Database table not found" 或 "doesn't exist"

**解决方案**:
1. 创建数据库（如果不存在）：
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS outfitr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

2. 执行数据库初始化脚本：
   ```bash
   mysql -u root -p outfitr < webapp/database/init/schema.sql
   ```

   或者在MySQL客户端中：
   ```sql
   USE outfitr;
   SOURCE webapp/database/init/schema.sql;
   ```

### 3. JWT_SECRET未设置

**症状**: Token生成失败

**解决方案**:
在 `webapp/backend/.env` 文件中设置：
```env
JWT_SECRET=your-strong-secret-key-at-least-32-characters-long
```

### 4. 环境变量未加载

**症状**: 所有配置都使用默认值

**解决方案**:
1. 确保 `.env` 文件存在于 `webapp/backend/` 目录
2. 确保文件名是 `.env`（不是 `.env.example`）
3. 重启后端服务器

### 5. 后端服务器未运行

**症状**: 网络错误或连接被拒绝

**解决方案**:
1. 进入后端目录：
   ```bash
   cd webapp/backend
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   ```

3. 检查服务器是否在 http://localhost:3001 运行

### 6. CORS错误

**症状**: 浏览器控制台显示CORS错误

**解决方案**:
- 确保后端已配置CORS中间件（已在代码中配置）
- 检查前端是否正确配置了API URL

## 快速检查清单

- [ ] MySQL服务正在运行
- [ ] 数据库 `outfitr` 已创建
- [ ] 数据库表已初始化（执行了schema.sql）
- [ ] `webapp/backend/.env` 文件存在且配置正确
- [ ] JWT_SECRET已设置
- [ ] 后端服务器正在运行（端口3001）
- [ ] 前端API URL配置正确

## 测试步骤

1. **测试数据库连接**:
   ```bash
   cd webapp/backend
   npm run dev
   ```
   查看控制台输出，应该显示 "✅ Database connected successfully"

2. **测试注册API**:
   ```bash
   curl -X POST http://localhost:3001/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","nickname":"Test User"}'
   ```

3. **检查后端日志**:
   查看后端控制台的错误日志，应该显示详细的错误信息

## 获取详细错误信息

后端现在会记录详细的错误信息到控制台。如果注册失败，请查看：
1. 后端服务器控制台的错误日志
2. 浏览器开发者工具的网络标签页，查看API响应
3. 浏览器控制台的错误信息

## 需要帮助？

如果问题仍然存在，请提供：
1. 后端控制台的完整错误日志
2. 浏览器开发者工具中API请求的响应内容
3. `.env` 文件配置（隐藏敏感信息）


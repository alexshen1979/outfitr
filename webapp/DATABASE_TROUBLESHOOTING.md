# 数据库连接故障排除指南

## 问题诊断

如果看到数据库连接失败的错误，请检查以下几点：

### 1. 检查环境变量是否正确加载

在 `webapp/backend` 目录下运行：

```powershell
node -e "require('dotenv').config(); console.log('DB_HOST:', process.env.DB_HOST);"
```

应该显示：`DB_HOST: 192.131.142.200`

### 2. 检查 .env 文件

确认 `webapp/backend/.env` 文件存在且包含：

```env
DB_HOST=192.131.142.200
DB_PORT=3306
DB_USER=dev_outfitr
DB_PASSWORD=tsN7NzSewMsyRihw
DB_NAME=dev_outfitr
```

### 3. 测试数据库连接

```powershell
cd webapp\backend
node -e "require('dotenv').config(); const mysql = require('mysql2/promise'); (async () => { try { const conn = await mysql.createConnection({ host: process.env.DB_HOST, port: parseInt(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME }); await conn.ping(); console.log('✅ Connection successful'); await conn.end(); } catch(e) { console.error('❌ Connection failed:', e.message); } })();"
```

### 4. 常见错误及解决方案

#### 错误：`EACCES` 或 `ECONNREFUSED` 连接到 localhost

**原因**：环境变量未正确加载，使用了默认的 localhost

**解决**：
- 确认 `.env` 文件存在
- 重启服务器（确保 `dotenv.config()` 被执行）
- 检查 `database.ts` 中是否调用了 `dotenv.config()`

#### 错误：`ER_HOST_NOT_PRIVILEGED`

**原因**：MySQL 服务器不允许从当前 IP 连接

**解决**：需要在 MySQL 服务器上执行：
```sql
GRANT ALL PRIVILEGES ON dev_outfitr.* TO 'dev_outfitr'@'%' IDENTIFIED BY 'tsN7NzSewMsyRihw';
FLUSH PRIVILEGES;
```

#### 错误：`ETIMEDOUT`

**原因**：网络连接超时，无法访问数据库服务器

**解决**：
- 检查网络连接
- 确认数据库服务器 IP 地址正确
- 检查防火墙设置
- 确认数据库服务器正在运行

### 5. 验证修复

修复后，重启服务器应该看到：

```
✅ Database connected: 192.131.142.200:3306/dev_outfitr
🚀 Server is running on http://localhost:3001
```

## 当前配置

- **数据库服务器**: 192.131.142.200:3306
- **数据库名**: dev_outfitr
- **用户名**: dev_outfitr
- **密码**: tsN7NzSewMsyRihw

## 注意事项

- 服务器即使数据库连接失败也会启动（这是预期的行为）
- 数据库相关的 API 端点会在实际使用时尝试连接
- 如果数据库连接失败，某些功能（如用户注册、登录）将无法正常工作


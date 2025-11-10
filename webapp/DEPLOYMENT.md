# OUTFITR 版本1.0 部署指南

## 前置要求

### 必需软件
- Node.js >= 18.0.0
- MySQL >= 8.0.0
- npm >= 9.0.0 或 yarn >= 1.22.0

### 必需配置
- MySQL数据库访问权限
- AI API聚合平台账号和密钥

## 部署步骤

### 步骤1: 数据库初始化

```bash
# 进入项目目录
cd webapp/database

# 执行数据库初始化脚本
mysql -u root -p < init/schema.sql
```

或者在MySQL客户端中执行：
```sql
source init/schema.sql;
```

### 步骤2: 后端配置

```bash
cd webapp/backend

# 安装依赖
npm install

# 复制环境变量文件
cp ENV.example .env

# 编辑.env文件，填入实际配置
# 必须配置：
# - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
# - JWT_SECRET（生产环境使用强密码）
# - AI_API_KEY, AI_API_ENDPOINT
```

### 步骤3: 前端配置

```bash
cd webapp/frontend

# 安装依赖
npm install

# 复制环境变量文件
cp ENV.example .env.local

# 编辑.env.local文件
# 配置 NEXT_PUBLIC_API_URL（后端API地址）
```

### 步骤4: 创建上传目录

```bash
# 后端目录
cd webapp/backend
mkdir -p uploads/avatars uploads/wardrobe uploads/outfit-results uploads/user-photos
```

### 步骤5: 启动服务

**开发环境**：
```bash
# 终端1：启动后端
cd webapp/backend
npm run dev

# 终端2：启动前端
cd webapp/frontend
npm run dev
```

**生产环境**：
```bash
# 构建后端
cd webapp/backend
npm run build

# 构建前端
cd webapp/frontend
npm run build

# 启动后端
cd webapp/backend
npm start

# 启动前端
cd webapp/frontend
npm start
```

### 步骤6: 使用PM2管理（推荐）

```bash
# 安装PM2
npm install -g pm2

# 启动后端
cd webapp/backend
pm2 start npm --name "outfitr-backend" -- start

# 启动前端
cd webapp/frontend
pm2 start npm --name "outfitr-frontend" -- start

# 查看状态
pm2 status

# 查看日志
pm2 logs outfitr-backend
pm2 logs outfitr-frontend
```

## 验证部署

1. **后端健康检查**：
   ```bash
   curl http://localhost:3001/health
   ```

2. **前端访问**：
   - 打开浏览器访问 http://localhost:3000
   - 测试注册和登录功能

3. **API测试**：
   ```bash
   # 注册用户
   curl -X POST http://localhost:3001/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","nickname":"Test User"}'
   ```

## 故障排查

### 后端无法启动
- 检查MySQL是否运行：`mysql -u root -p`
- 检查.env文件配置是否正确
- 检查端口3001是否被占用

### 前端无法访问后端
- 检查NEXT_PUBLIC_API_URL配置
- 检查后端是否正常运行
- 检查CORS配置

### 数据库连接失败
- 检查数据库是否运行
- 检查.env中的数据库配置
- 检查数据库用户权限

### 图片上传失败
- 检查uploads目录权限
- 检查文件大小限制
- 检查磁盘空间

## 安全建议

1. **JWT_SECRET**：使用强密码（至少32字符）
2. **数据库密码**：使用强密码
3. **HTTPS**：生产环境必须使用HTTPS
4. **API密钥**：不要提交到代码仓库
5. **文件上传**：限制文件类型和大小
6. **环境变量**：敏感信息不要硬编码

## 监控建议

1. **日志**：配置日志收集和分析
2. **错误监控**：集成Sentry或类似服务
3. **性能监控**：监控API响应时间
4. **数据库监控**：监控数据库连接和查询性能
5. **服务器监控**：监控CPU、内存、磁盘使用

## 备份策略

1. **数据库备份**：
   ```bash
   mysqldump -u root -p outfitr > backup_$(date +%Y%m%d).sql
   ```

2. **文件备份**：
   - 定期备份uploads目录
   - 使用云存储自动备份

3. **代码备份**：
   - 使用Git版本控制
   - 定期推送代码到远程仓库

## 性能优化建议

1. **数据库**：
   - 添加适当的索引
   - 优化查询语句
   - 使用连接池

2. **文件存储**：
   - 生产环境使用CDN
   - 图片压缩和优化
   - 使用云存储服务

3. **API**：
   - 实现请求缓存
   - 使用Redis缓存
   - API响应压缩

4. **前端**：
   - 代码分割和懒加载
   - 图片优化
   - 使用CDN

## 下一步

版本1.0部署完成后，可以开始：
- 收集用户反馈
- 监控系统性能
- 准备版本2.0开发


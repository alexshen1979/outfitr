# 服务器启动说明

## 问题诊断

当前服务器无法正常启动，可能是以下原因：

1. **依赖问题**：`iconv-lite` 模块损坏
2. **端口占用**：3000 或 3001 端口被占用
3. **环境变量**：`.env` 文件配置问题

## 手动启动步骤

### 1. 启动后端服务器

打开新的 PowerShell 或 CMD 窗口：

```powershell
cd C:\00-DE-Sync\00-DigitsEcho\00-outfitr\webapp\backend
npm run dev
```

或者双击运行：`webapp/backend/start-backend.bat`

**预期输出**：
```
✅ Database connected successfully
🚀 Server is running on http://localhost:3001
```

### 2. 启动前端服务器

打开另一个新的 PowerShell 或 CMD 窗口：

```powershell
cd C:\00-DE-Sync\00-DigitsEcho\00-outfitr\webapp\frontend
npm run dev
```

或者双击运行：`webapp/frontend/start-frontend.bat`

**预期输出**：
```
- Local:        http://localhost:3000
```

### 3. 验证服务器状态

在浏览器中访问：
- 后端健康检查：http://localhost:3001/health
- 前端首页：http://localhost:3000

## 如果遇到错误

### 错误：`Cannot find module '../encodings'`

**解决方案**：
```powershell
cd webapp/backend
Remove-Item -Recurse -Force node_modules
npm cache clean --force
npm install
```

### 错误：端口被占用

**解决方案**：
```powershell
# 查找占用端口的进程
netstat -ano | findstr :3001
netstat -ano | findstr :3000

# 结束进程（替换 PID 为实际进程ID）
taskkill /PID <PID> /F
```

### 错误：数据库连接失败

**检查**：
1. 确认 `.env` 文件存在且配置正确
2. 确认数据库服务器可访问
3. 确认数据库表已创建

## 测试注册功能

服务器启动后：
1. 访问 http://localhost:3000/register
2. 填写注册表单
3. 如果遇到 400 错误，查看浏览器控制台的 Network 标签页，查看具体错误信息

## 已完成的修复

1. ✅ 删除了 `test-server.ts` 文件（可能导致冲突）
2. ✅ 重新安装了后端依赖
3. ✅ 改进了前端错误处理
4. ✅ 添加了详细的错误日志


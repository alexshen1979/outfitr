# 服务器启动问题解决方案

## 问题诊断

服务器无法通过后台进程正常启动。这可能是由于：
1. PowerShell 后台进程限制
2. 服务器启动需要更多时间
3. 需要查看详细的启动日志

## 解决方案：使用批处理文件启动

我已经更新了启动脚本，现在包含：
- 依赖安装检查
- 详细的状态输出
- 错误信息显示

### 启动步骤

**方法一：双击启动脚本（推荐）**

1. **启动后端**：
   - 双击运行：`webapp/backend/start-backend.bat`
   - 等待看到 "Server is running on http://localhost:3001"

2. **启动前端**：
   - 打开另一个窗口
   - 双击运行：`webapp/frontend/start-frontend.bat`
   - 等待看到 "Local: http://localhost:3000"

**方法二：使用 PowerShell**

打开两个 PowerShell 窗口：

**窗口1 - 后端**：
```powershell
cd C:\00-DE-Sync\00-DigitsEcho\00-outfitr\webapp\backend
npm run dev
```

**窗口2 - 前端**：
```powershell
cd C:\00-DE-Sync\00-DigitsEcho\00-outfitr\webapp\frontend
npm run dev
```

## 验证服务器启动

启动后，在浏览器中访问：
- **后端健康检查**：http://localhost:3001/health
- **前端首页**：http://localhost:3000

## 如果仍然无法启动

### 检查错误信息

查看启动脚本窗口中的错误信息，常见问题：

1. **端口被占用**：
   ```powershell
   netstat -ano | findstr ":3001"
   netstat -ano | findstr ":3000"
   ```

2. **依赖未安装**：
   ```powershell
   cd webapp\backend
   npm install
   ```

3. **TypeScript 编译错误**：
   ```powershell
   cd webapp\backend
   npm run type-check
   ```

## 已完成的修复

✅ TypeScript 编译错误已修复
✅ 依赖已安装（包括 axios）
✅ 启动脚本已更新
✅ 数据库配置已完成

请使用启动脚本手动启动服务器，然后告诉我结果。


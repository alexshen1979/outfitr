# 启动脚本说明

## start-all.bat

这是一个Windows批处理脚本，用于同时启动前端和后端服务器。

### 使用方法

1. **双击运行** `webapp/start-all.bat`
2. 脚本会自动：
   - 打开两个新的命令行窗口
   - 一个窗口运行后端服务器（端口 3001）
   - 另一个窗口运行前端服务器（端口 3000）
   - 自动安装依赖（如果需要）

### 功能特点

- ✅ 自动检测目录路径
- ✅ 在新窗口中启动服务器（不会阻塞）
- ✅ 自动安装依赖
- ✅ 显示清晰的启动信息
- ✅ 支持中文显示

### 服务器地址

启动成功后：
- **后端API**: http://localhost:3001
- **前端应用**: http://localhost:3000

### 停止服务器

要停止服务器，只需关闭对应的命令行窗口即可。

### 单独启动

如果需要单独启动：

- **仅后端**: 双击 `webapp/backend/start-backend.bat`
- **仅前端**: 双击 `webapp/frontend/start-frontend.bat`

### 故障排除

如果启动失败：

1. 检查端口是否被占用：
   ```cmd
   netstat -ano | findstr ":3001"
   netstat -ano | findstr ":3000"
   ```

2. 检查 Node.js 是否安装：
   ```cmd
   node --version
   npm --version
   ```

3. 手动安装依赖：
   ```cmd
   cd webapp\backend
   npm install
   cd ..\frontend
   npm install
   ```


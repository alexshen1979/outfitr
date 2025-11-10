# Clash Verge Git 代理配置指南

## Clash Verge 默认端口

Clash Verge 的默认代理端口：
- **HTTP 代理端口**：`7890`
- **SOCKS5 代理端口**：`7891`

## 配置 Git 使用 Clash Verge 代理

### 方法 1：使用 HTTP 代理（推荐）

在 Mac 终端中运行：

```bash
# 配置 Git 使用 Clash Verge 的 HTTP 代理
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 验证配置
git config --global --get http.proxy
git config --global --get https.proxy
```

### 方法 2：只对 GitHub 使用代理（更推荐）

这样配置后，只有访问 GitHub 时使用代理，其他 Git 操作不受影响：

```bash
# 只对 GitHub 使用代理
git config --global http.https://github.com.proxy http://127.0.0.1:7890
git config --global https.https://github.com.proxy http://127.0.0.1:7890
```

### 方法 3：使用 SOCKS5 代理

如果 HTTP 代理不行，可以尝试 SOCKS5：

```bash
git config --global http.proxy socks5://127.0.0.1:7891
git config --global https.proxy socks5://127.0.0.1:7891
```

## 验证配置

配置完成后，测试连接：

```bash
# 测试 GitHub 连接
curl -I https://github.com

# 如果返回 HTTP/2 200，说明连接成功
```

## 克隆项目

配置完成后，就可以正常克隆了：

```bash
git clone https://github.com/alexshen1979/outfitr.git
```

## 如果端口不是 7890/7891

如果您的 Clash Verge 使用了其他端口，可以查看：

1. 打开 Clash Verge
2. 点击设置（Settings）
3. 查看 "Port" 或 "端口" 设置
4. 找到 HTTP 端口和 SOCKS5 端口

## 取消代理配置

如果需要取消代理配置：

```bash
# 取消全局代理
git config --global --unset http.proxy
git config --global --unset https.proxy

# 取消 GitHub 专用代理
git config --global --unset http.https://github.com.proxy
git config --global --unset https.https://github.com.proxy
```

## 常见问题

### 问题 1：仍然连接不上

检查 Clash Verge 是否开启了 "Allow LAN"（允许局域网）：
- 打开 Clash Verge 设置
- 确保 "Allow LAN" 已开启

### 问题 2：端口被占用

如果 7890 端口被占用，可以在 Clash Verge 设置中修改端口。

### 问题 3：只想对特定域名使用代理

```bash
# 只对 GitHub 使用代理
git config --global http.https://github.com.proxy http://127.0.0.1:7890

# 只对 GitLab 使用代理（如果需要）
git config --global http.https://gitlab.com.proxy http://127.0.0.1:7890
```


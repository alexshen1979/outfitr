# GitHub 克隆问题解决方案

## 问题描述
在 Mac 上克隆 GitHub 项目时出现：
```
Failed to connect to github.com port 443 after 75002ms: Couldn't connect to server.
```

## 解决方案

### 方案 1：配置代理（推荐，如果使用 VPN/代理）

如果您使用 VPN 或代理，需要配置 Git 使用代理：

```bash
# HTTP/HTTPS 代理
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# SOCKS5 代理（如 Clash）
git config --global http.proxy socks5://127.0.0.1:7890
git config --global https.proxy socks5://127.0.0.1:7890

# 查看当前代理配置
git config --global --get http.proxy
git config --global --get https.proxy

# 取消代理配置
git config --global --unset http.proxy
git config --global --unset https.proxy
```

**注意**：将 `7890` 替换为您实际的代理端口（常见端口：7890, 1080, 8080）

### 方案 2：使用 GitHub 镜像站点

#### 方法 A：使用 GitHub 镜像（gitee.com 或其他镜像）

```bash
# 使用 Gitee 镜像（需要先在 Gitee 上导入 GitHub 仓库）
git clone https://gitee.com/your-username/outfitr.git

# 或者使用其他 GitHub 镜像
git clone https://github.com.cnpmjs.org/alexshen1979/outfitr.git
```

#### 方法 B：修改 hosts 文件（临时方案）

编辑 `/etc/hosts` 文件，添加：

```bash
sudo nano /etc/hosts
```

添加以下内容：
```
# GitHub
140.82.112.3 github.com
140.82.112.4 github.com
185.199.108.153 assets-cdn.github.com
```

### 方案 3：使用 SSH 方式克隆（如果已配置 SSH Key）

```bash
# 使用 SSH 方式克隆
git clone git@github.com:alexshen1979/outfitr.git

# 如果 SSH 也连接不上，可能需要配置 SSH 代理
# 编辑 ~/.ssh/config 文件
nano ~/.ssh/config

# 添加以下内容（如果使用代理）
Host github.com
    HostName github.com
    User git
    ProxyCommand nc -X 5 -x 127.0.0.1:7890 %h %p
```

### 方案 4：检查网络连接

```bash
# 测试 GitHub 连接
ping github.com

# 测试 HTTPS 连接
curl -I https://github.com

# 检查 DNS 解析
nslookup github.com
```

### 方案 5：使用 GitHub CLI（如果已安装）

```bash
# 安装 GitHub CLI（如果未安装）
brew install gh

# 登录 GitHub
gh auth login

# 使用 gh 克隆
gh repo clone alexshen1979/outfitr
```

### 方案 6：手动下载 ZIP 文件

如果以上方法都不行，可以：
1. 访问：https://github.com/alexshen1979/outfitr
2. 点击 "Code" → "Download ZIP"
3. 下载后解压到本地目录
4. 在解压后的目录中初始化 Git：
   ```bash
   cd outfitr
   git init
   git remote add origin https://github.com/alexshen1979/outfitr.git
   ```

## 推荐配置（针对中国大陆用户）

### 1. 配置 Git 使用代理（如果使用 VPN）

```bash
# 设置代理（替换为您的代理端口）
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 只对 GitHub 使用代理（推荐）
git config --global http.https://github.com.proxy http://127.0.0.1:7890
git config --global https.https://github.com.proxy http://127.0.0.1:7890
```

### 2. 配置 Git 使用更长的超时时间

```bash
git config --global http.postBuffer 524288000
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999
```

### 3. 使用 SSH 密钥（推荐长期使用）

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 将公钥添加到 GitHub
cat ~/.ssh/id_ed25519.pub
# 复制输出内容，然后访问 https://github.com/settings/keys 添加

# 测试 SSH 连接
ssh -T git@github.com
```

## 快速诊断命令

```bash
# 检查 Git 配置
git config --list

# 检查网络连接
curl -v https://github.com

# 检查代理设置
echo $http_proxy
echo $https_proxy
```

## 常见代理端口

- Clash: 7890
- V2Ray: 1080
- Shadowsocks: 1080
- 其他代理工具：查看其设置中的端口号


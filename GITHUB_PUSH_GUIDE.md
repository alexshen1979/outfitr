# GitHub 推送指南

## 重要提示
GitHub 从 2021 年 8 月起不再支持密码认证，您需要使用 **Personal Access Token (PAT)** 来推送代码。

## 步骤 1：创建 Personal Access Token

1. 访问：https://github.com/settings/tokens
2. 点击 **"Generate new token"** -> **"Generate new token (classic)"**
3. 填写信息：
   - **Note（备注）**：`outfitr-push`（或任意名称）
   - **Expiration（过期时间）**：选择合适的时间（建议 90 天或 No expiration）
   - **Select scopes（权限）**：至少勾选 **`repo`** 权限（这会自动勾选所有 repo 相关权限）
4. 点击 **"Generate token"**
5. **重要**：复制生成的 token（格式类似：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`），**只显示一次，请立即保存**

## 步骤 2：创建 GitHub 仓库

有两种方式：

### 方式 A：通过网页创建（推荐）
1. 访问：https://github.com/new
2. 填写仓库信息：
   - **Repository name**：`outfitr`（或您喜欢的名称）
   - **Description**：`AI-powered outfit generation platform`
   - **Visibility**：选择 Public 或 Private
3. **不要**勾选 "Initialize this repository with a README"
4. 点击 **"Create repository"**

### 方式 B：通过 API 创建（需要 token）
如果您已经创建了 token，可以告诉我，我会帮您通过 API 创建仓库。

## 步骤 3：推送代码

创建仓库后，使用以下命令推送：

```bash
# 添加远程仓库（将 YOUR_USERNAME 和 REPO_NAME 替换为实际值）
git remote add origin https://github.com/zjsxr1979/outfitr.git

# 推送代码（使用 token 作为密码）
git push -u origin master
```

当提示输入用户名时，输入：`zjsxr1979`
当提示输入密码时，输入：**您的 Personal Access Token**（不是 GitHub 密码）

## 或者使用 token 直接推送

```bash
git remote add origin https://YOUR_TOKEN@github.com/zjsxr1979/outfitr.git
git push -u origin master
```

（将 YOUR_TOKEN 替换为您的实际 token）

## 注意事项

- ⚠️ **不要**将 token 提交到代码仓库
- ⚠️ **不要**在公开场合分享您的 token
- ✅ token 已保存在 `.gitignore` 中，不会被提交
- ✅ 如果 token 泄露，请立即在 GitHub 设置中撤销它


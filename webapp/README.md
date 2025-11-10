# OUTFITR（穿搭方程式）

> AI驱动的智能穿搭助手Web应用 - 让每个人都能轻松找到完美的穿搭方案

## 项目概述

OUTFITR（穿搭方程式）是一款基于人工智能技术的智能穿搭助手Web应用，通过用户上传的个人照片和服装图片，利用AI技术生成个性化的穿搭效果图，帮助用户轻松搭配出完美的造型。

**项目定位**：面向全球用户的智能穿搭助手平台  
**核心理念**：让时尚触手可及，让穿搭变得简单有趣  
**目标用户**：时尚爱好者、购物达人、穿搭新手等所有关注个人形象的用户

---

## 项目背景与愿景

### 背景

在当今快节奏的生活中，许多用户在穿搭选择上遇到困扰：
- 不知道如何搭配已有的服装
- 看到心仪的单品但不确定是否适合自己
- 想要尝试新风格但缺乏专业建议
- 线上购物时无法直观看到穿搭效果

OUTFITR致力于通过AI技术解决这些痛点，为用户提供便捷、智能的穿搭解决方案。

### 愿景

成为全球领先的AI穿搭助手平台，让每个人都能：
- 轻松管理个人服装库
- 快速获得专业的穿搭建议
- 直观预览穿搭效果
- 发现适合自己的时尚风格

---

## 核心功能模块

### 功能1：AI穿搭生成

用户上传个人照片和服装图片，系统通过AI技术自动生成穿搭效果图，让用户直观看到不同服装组合的搭配效果。

**核心特性**：
- 支持多张服装图片同时上传
- 自动识别人物姿态和服装类型
- 生成高质量的穿搭效果图
- 支持生成多种搭配方案

### 功能2：个人衣柜管理

用户可以将自己的服装和配饰上传到个人衣柜，进行分类管理，随时查看和选择进行搭配。

**核心特性**：
- 图片上传与分类管理
- 服装标签（季节、风格、场合等）
- 衣柜搜索与筛选
- 收藏与收藏夹管理

### 功能3：快速搭配

用户上传单张服装或配饰照片，AI自动从衣柜中选择合适的单品进行搭配，或生成新的搭配建议。

**核心特性**：
- 单张图片快速识别
- 智能匹配衣柜中的单品
- 生成多种搭配方案
- 支持新品的搭配预览

### 功能4：增值服务体系

提供免费基础功能和付费高级功能，满足不同用户的需求。

**免费基础功能**：
- 每日3次AI穿搭生成
- 基础衣柜管理（最多50件）
- 标准清晰度效果图
- 基础搭配建议

**付费高级功能**：
- 月度会员（¥29/月）：无限次生成、无限衣柜、高清效果图、视频展示
- 年度会员（¥299/年）：包含月度会员所有功能 + 专属AI顾问 + 场景化搭配 + 趋势分析
- 单次付费：高清效果图、视频效果展示
- 高级功能：自定义AI风格、API接口调用、品牌合作展示位

---

## 用户场景描述

### 场景1：新用户首次使用

**用户流程**：
1. 注册账号并登录
2. 上传个人照片（建立个人形象库）
3. 上传几件常用服装到衣柜
4. 选择服装尝试首次AI穿搭生成
5. 查看生成的效果图，了解系统功能

**价值体现**：快速上手，体验核心功能，建立初步印象

### 场景2：日常使用 - 衣柜搭配

**用户流程**：
1. 登录系统，进入个人衣柜
2. 选择多件服装进行搭配
3. 发起AI穿搭生成请求
4. 查看生成的多种搭配方案
5. 保存喜欢的搭配到收藏夹

**价值体现**：充分利用已有服装，发现新的搭配可能性

### 场景3：快速搭配 - 新品预览

**用户流程**：
1. 看到心仪的单品（线上或线下）
2. 拍摄或上传单品照片
3. 使用快速搭配功能
4. 查看AI推荐的搭配方案
5. 决定是否购买

**价值体现**：购物决策辅助，降低购买风险

### 场景4：会员用户 - 高级功能

**用户流程**：
1. 会员用户登录
2. 使用高清效果图功能
3. 生成视频效果展示
4. 使用场景化搭配（工作、约会、聚会等）
5. 查看个性化趋势分析报告

**价值体现**：更专业的穿搭建议，更丰富的功能体验

---

## 技术架构设计

### 架构概述

OUTFITR采用前后端分离的架构设计，确保系统的可扩展性和可维护性。

```
┌─────────────────┐
│   前端 (Next.js) │
│   Next.js 14+    │
│   TypeScript     │
│   Tailwind CSS   │
└────────┬─────────┘
         │ HTTP/REST API
         │
┌────────▼─────────┐
│   后端 (Node.js) │
│   Express.js     │
│   TypeScript     │
│   RESTful API    │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│ MySQL │ │ AI服务   │
│Database│ │API聚合平台│
└───────┘ └─────────┘
```

### 前端技术栈

- **框架**：Next.js 14+（App Router）
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **状态管理**：Zustand / React Context
- **表单处理**：React Hook Form
- **HTTP客户端**：Axios / Fetch API
- **国际化**：next-i18next（支持中文/英文）
- **图片处理**：React Image Crop / Cropper.js

### 后端技术栈

- **运行环境**：Node.js 18+
- **框架**：Express.js
- **语言**：TypeScript
- **数据库**：MySQL 8.0+
- **ORM**：Prisma / TypeORM
- **身份认证**：JWT（JSON Web Token）
- **文件上传**：Multer + 云存储（OSS/S3）
- **API文档**：Swagger/OpenAPI
- **日志**：Winston
- **缓存**：Redis（可选）

### AI服务集成

**服务提供商**：API聚合平台（统一接口访问多个AI模型）

**集成方式**：
- 统一AI服务接口层，抽象不同AI服务商的差异
- 支持动态切换AI模型（Stable Diffusion、DALL-E等）
- 实现请求重试、缓存、降级策略
- 支持批量请求和异步处理

**主要功能**：
- 图像生成（穿搭效果图）
- 图像识别（服装类型、颜色、风格）
- 图像编辑（融合、合成）

### 数据库设计

**核心数据表**：

1. **users**（用户表）
   - id, email, password_hash, nickname, avatar, created_at, updated_at
   - role（用户角色：free/premium/vip）

2. **wardrobe_items**（衣柜物品表）
   - id, user_id, name, image_url, category, tags, season, style, created_at

3. **outfit_results**（穿搭结果表）
   - id, user_id, result_image_url, input_items（JSON）, style, created_at

4. **user_photos**（用户照片表）
   - id, user_id, photo_url, photo_type, is_active, created_at

5. **subscriptions**（订阅表）
   - id, user_id, plan_type, start_date, end_date, status

6. **api_usage_logs**（API使用日志表）
   - id, user_id, api_type, request_count, date, cost

### API设计规范

**RESTful API设计原则**：
- 使用HTTP动词（GET、POST、PUT、DELETE）
- 资源导向的URL设计
- 统一的响应格式
- 完善的错误处理
- API版本控制

**核心API端点**：

```
POST   /api/v1/auth/register          # 用户注册
POST   /api/v1/auth/login             # 用户登录
GET    /api/v1/user/profile           # 获取用户信息

POST   /api/v1/wardrobe/items         # 添加入衣柜物品
GET    /api/v1/wardrobe/items         # 获取衣柜列表
DELETE /api/v1/wardrobe/items/:id     # 删除衣柜物品

POST   /api/v1/outfit/generate        # 生成穿搭效果
GET    /api/v1/outfit/history         # 获取穿搭历史

POST   /api/v1/upload/image           # 图片上传
```

### 文件存储策略

**推荐方案**：云存储服务
- **国内**：阿里云OSS / 腾讯云COS
- **国际**：AWS S3 / Cloudflare R2
- **CDN加速**：配置CDN加速图片访问

**存储结构**：
```
uploads/
  ├── avatars/          # 用户头像
  ├── wardrobe/         # 衣柜物品图片
  ├── outfit-results/   # 穿搭结果图片
  └── user-photos/      # 用户个人照片
```

---

## 目录结构说明

```
webapp/
├── frontend/                 # Next.js前端项目
│   ├── src/
│   │   ├── app/             # Next.js App Router页面
│   │   ├── components/      # React组件
│   │   ├── lib/             # 工具函数
│   │   ├── hooks/           # 自定义Hooks
│   │   ├── store/           # 状态管理
│   │   └── types/           # TypeScript类型定义
│   ├── public/              # 静态资源
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                  # Node.js后端API项目
│   ├── src/
│   │   ├── routes/          # API路由
│   │   ├── controllers/    # 控制器
│   │   ├── services/       # 业务逻辑层
│   │   ├── models/         # 数据模型
│   │   ├── middleware/     # 中间件
│   │   ├── utils/          # 工具函数
│   │   └── config/         # 配置文件
│   ├── package.json
│   └── tsconfig.json
│
├── database/                 # SQL脚本目录
│   ├── init/               # 初始化脚本
│   ├── migrations/         # 数据库迁移脚本
│   └── seeds/              # 种子数据
│
├── README.md                # 项目蓝图（本文件）
└── DEV_PLAN.md             # 开发计划
```

---

## 开发环境要求

### 必需软件

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0 或 **yarn**: >= 1.22.0
- **MySQL**: >= 8.0.0
- **Git**: >= 2.30.0

### 推荐工具

- **IDE**: VS Code / WebStorm
- **数据库管理**: MySQL Workbench / DBeaver
- **API测试**: Postman / Insomnia
- **版本控制**: Git

### 环境变量配置

创建 `.env` 文件（前端和后端分别配置）：

**前端 `.env.local`**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_ENV=development
```

**后端 `.env`**:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=mysql://user:password@localhost:3306/outfitr
JWT_SECRET=your-secret-key
AI_API_KEY=your-ai-api-key
AI_API_ENDPOINT=https://api.example.com
UPLOAD_DIR=./uploads
```

---

## 快速开始指南

### 1. 克隆项目

```bash
git clone <repository-url>
cd outfitr/webapp
```

### 2. 数据库初始化

```bash
cd database
mysql -u root -p < init/schema.sql
mysql -u root -p outfitr < seeds/initial_data.sql
```

### 3. 后端启动

```bash
cd backend
npm install
cp .env.example .env
# 编辑.env文件，填入配置信息
npm run dev
```

后端服务将在 `http://localhost:3001` 启动

### 4. 前端启动

```bash
cd frontend
npm install
cp .env.local.example .env.local
# 编辑.env.local文件，填入配置信息
npm run dev
```

前端应用将在 `http://localhost:3000` 启动

### 5. 验证安装

- 访问 `http://localhost:3000` 查看前端页面
- 访问 `http://localhost:3001/api/v1/health` 检查后端API

---

## 部署与运维

### 生产环境部署

**前端部署**：
- 推荐平台：Vercel / Netlify / 自建服务器
- 构建命令：`npm run build`
- 启动命令：`npm start`

**后端部署**：
- 推荐平台：AWS / 阿里云 / 腾讯云
- 使用PM2管理进程：`pm2 start dist/index.js`
- 配置Nginx反向代理

### 环境变量配置

生产环境需要配置以下环境变量：
- 数据库连接字符串
- JWT密钥
- AI服务API密钥
- 文件存储配置
- 第三方服务密钥

### 监控与日志

- **应用监控**：集成Sentry或类似服务
- **日志管理**：使用Winston记录日志，建议接入ELK或类似系统
- **性能监控**：配置APM工具（如New Relic）

### 备份策略

- **数据库备份**：每日自动备份，保留30天
- **文件备份**：云存储自带备份功能
- **代码备份**：Git仓库管理

---

## 贡献指南

### 代码规范

- 遵循ESLint和Prettier配置
- 使用TypeScript严格模式
- 编写清晰的注释和文档
- 遵循RESTful API设计规范

### 提交规范

使用Conventional Commits规范：
```
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建过程或辅助工具的变动
```

### 开发流程

1. 从main分支创建功能分支
2. 开发并编写测试
3. 提交代码并创建Pull Request
4. 代码审查通过后合并

---

## 许可证

本项目采用 [MIT License](LICENSE) 许可证。

---

## 联系方式

如有问题或建议，请通过以下方式联系：

- **项目Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **邮箱**: support@outfitr.com

---

**最后更新**: 2025-01-XX


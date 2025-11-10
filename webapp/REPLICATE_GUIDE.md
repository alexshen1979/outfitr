# Replicate API 使用指南

## 📋 目录

1. [注册和申请](#注册和申请)
2. [获取 API Key](#获取-api-key)
3. [安装和配置](#安装和配置)
4. [查找合适的模型](#查找合适的模型)
5. [代码集成](#代码集成)
6. [API 调用示例](#api-调用示例)
7. [成本说明](#成本说明)
8. [常见问题](#常见问题)

---

## 1. 注册和申请

### 步骤 1：访问 Replicate 官网

访问：https://replicate.com/

### 步骤 2：注册账号

1. 点击右上角的 **"Sign Up"** 或 **"Get Started"**
2. 选择注册方式：
   - **GitHub 账号登录**（推荐，开发者常用）
   - **Google 账号登录**
   - **邮箱注册**

### 步骤 3：验证邮箱（如果使用邮箱注册）

- 检查邮箱收件箱
- 点击验证链接完成注册

### 步骤 4：首次使用

- 注册成功后，Replicate 会赠送 **$10 免费额度**
- 可以立即开始使用 API

---

## 2. 获取 API Key

### 步骤 1：登录账号

访问：https://replicate.com/account

### 步骤 2：进入 API Tokens 页面

1. 点击左侧菜单的 **"API Tokens"**
2. 或直接访问：https://replicate.com/account/api-tokens

### 步骤 3：创建 API Token

1. 点击 **"Create token"** 按钮
2. 输入 Token 名称（例如：`outfitr-production`）
3. 点击 **"Create"**
4. **重要**：复制并保存 Token（只显示一次，无法再次查看）

### 步骤 4：保存 Token

将 Token 保存到安全的地方，例如：
- 密码管理器
- 环境变量文件（`.env`）
- 服务器配置

**格式示例**：
```
r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 3. 安装和配置

### 3.1 安装 Replicate SDK

#### Node.js/TypeScript（后端）

```bash
npm install replicate
# 或
yarn add replicate
# 或
pnpm add replicate
```

#### Python（可选，如果使用 Python 后端）

```bash
pip install replicate
```

### 3.2 配置环境变量

在项目根目录的 `.env` 文件中添加：

```env
# Replicate API 配置
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AI_PROVIDER=replicate
```

**注意**：
- 不要将 `.env` 文件提交到 Git
- 生产环境使用服务器环境变量或密钥管理服务

### 3.3 验证配置

创建测试文件 `test-replicate.js`：

```javascript
const Replicate = require('replicate');

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// 测试连接
replicate.models.list()
  .then(models => {
    console.log('✅ Replicate API 连接成功！');
    console.log(`找到 ${models.results.length} 个模型`);
  })
  .catch(error => {
    console.error('❌ 连接失败：', error.message);
  });
```

运行测试：
```bash
node test-replicate.js
```

---

## 4. 查找合适的模型

### 4.1 浏览模型库

访问：https://replicate.com/explore

### 4.2 搜索虚拟试衣相关模型

**推荐搜索关键词**：
- `virtual try-on`
- `outfit generation`
- `fashion`
- `clothing`
- `ControlNet`
- `IP-Adapter`
- `Stable Diffusion`

### 4.3 推荐的模型

#### 方案 A：ControlNet + Stable Diffusion（推荐）

**模型**：`jagilley/controlnet-openpose` + `stability-ai/stable-diffusion`

**特点**：
- ✅ 精确控制人物姿态
- ✅ 可以保持用户照片的姿势
- ✅ 高质量生成

**使用场景**：
- 需要保持用户照片的姿势
- 需要精确控制服装位置

#### 方案 B：IP-Adapter（推荐）

**模型**：`lucataco/ip-adapter`

**特点**：
- ✅ 可以基于参考图像生成
- ✅ 保持风格一致性
- ✅ 适合虚拟试衣

**使用场景**：
- 基于用户照片生成穿搭效果
- 需要保持用户特征

#### 方案 C：专门的虚拟试衣模型

搜索关键词：`virtual try-on` 或 `outfit`

**示例模型**：
- `cuuupid/idm-vton`（IDM-VTON）
- `levihsu/ootdiffusion`（OOTDiffusion）

**特点**：
- ✅ 专为虚拟试衣设计
- ✅ 效果可能更好
- ⚠️ 需要查看具体模型文档

### 4.4 查看模型文档

1. 点击模型名称进入详情页
2. 查看 **"API"** 标签页
3. 查看输入参数说明
4. 查看输出格式说明
5. 查看示例代码

---

## 5. 代码集成

### 5.1 创建 Replicate 服务

创建文件：`webapp/backend/src/services/replicate.service.ts`

```typescript
import Replicate from 'replicate';
import { GenerateImageOptions, GenerateImageResult } from '../config/ai';

export interface ReplicateServiceConfig {
  apiToken: string;
  timeout?: number;
}

export class ReplicateService {
  private replicate: Replicate;
  private timeout: number;

  constructor(config: ReplicateServiceConfig) {
    this.replicate = new Replicate({
      auth: config.apiToken,
    });
    this.timeout = config.timeout || 60000; // 默认60秒
  }

  /**
   * 生成穿搭效果图（使用 IP-Adapter）
   */
  async generateOutfitImage(
    userPhotoUrl: string,
    clothingUrls: string[],
    options?: Partial<GenerateImageOptions>
  ): Promise<GenerateImageResult> {
    try {
      // 方案1：使用 IP-Adapter（推荐）
      const output = await this.replicate.run(
        'lucataco/ip-adapter:5a5277b4f1e0470510e403d3b26bc452f99a0d84',
        {
          input: {
            image: userPhotoUrl,
            prompt: this.buildOutfitPrompt(clothingUrls, options),
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 20,
            ...(options?.width && options?.height && {
              width: options.width,
              height: options.height,
            }),
          },
        }
      );

      // Replicate 返回的是数组或字符串
      const imageUrl = Array.isArray(output) ? output[0] : output;

      if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
        return {
          imageUrl,
          success: true,
        };
      }

      throw new Error('Invalid output format from Replicate');
    } catch (error: any) {
      console.error('Replicate API error:', error);
      return {
        imageUrl: '',
        success: false,
        error: error.message || 'Failed to generate image',
      };
    }
  }

  /**
   * 使用 ControlNet 生成（保持姿势）
   */
  async generateWithControlNet(
    userPhotoUrl: string,
    clothingUrls: string[],
    options?: Partial<GenerateImageOptions>
  ): Promise<GenerateImageResult> {
    try {
      // 第一步：提取姿势
      const poseOutput = await this.replicate.run(
        'jagilley/controlnet-openpose',
        {
          input: {
            image: userPhotoUrl,
          },
        }
      );

      const poseImageUrl = Array.isArray(poseOutput) ? poseOutput[0] : poseOutput;

      // 第二步：使用姿势生成穿搭
      const output = await this.replicate.run(
        'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
        {
          input: {
            prompt: this.buildOutfitPrompt(clothingUrls, options),
            image: poseImageUrl,
            controlnet_conditioning_scale: 1.0,
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 20,
            ...(options?.width && options?.height && {
              width: options.width,
              height: options.height,
            }),
          },
        }
      );

      const imageUrl = Array.isArray(output) ? output[0] : output;

      if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
        return {
          imageUrl,
          success: true,
        };
      }

      throw new Error('Invalid output format from Replicate');
    } catch (error: any) {
      console.error('Replicate ControlNet error:', error);
      return {
        imageUrl: '',
        success: false,
        error: error.message || 'Failed to generate image',
      };
    }
  }

  /**
   * 构建穿搭提示词
   */
  private buildOutfitPrompt(
    clothingUrls: string[],
    options?: Partial<GenerateImageOptions>
  ): string {
    const basePrompt = 'A realistic photo of a person wearing a fashionable outfit';
    const clothingDescription = clothingUrls.length > 0 
      ? `with ${clothingUrls.length} clothing items` 
      : '';
    
    const stylePrompt = options?.style 
      ? `, ${options.style} style`
      : ', high quality, detailed, professional photography';
    
    return `${basePrompt} ${clothingDescription}${stylePrompt}`;
  }
}
```

### 5.2 更新 AI 服务配置

修改：`webapp/backend/src/config/ai.ts`

```typescript
export interface AIServiceConfig {
  apiKey: string;
  endpoint: string;
  timeout: number;
  retryCount: number;
  provider?: 'piccopilot' | 'replicate' | 'aliyun' | 'default';
}

export const aiConfig: AIServiceConfig = {
  apiKey: process.env.REPLICATE_API_TOKEN || process.env.PIC_COPILOT_API_KEY || process.env.AI_API_KEY || '',
  endpoint: process.env.REPLICATE_API_ENDPOINT || process.env.PIC_COPILOT_API_ENDPOINT || process.env.AI_API_ENDPOINT || '',
  timeout: parseInt(process.env.REPLICATE_TIMEOUT || process.env.PIC_COPILOT_TIMEOUT || process.env.AI_TIMEOUT || '60000'),
  retryCount: 3,
  provider: (process.env.AI_PROVIDER || 'replicate') as 'piccopilot' | 'replicate' | 'aliyun' | 'default',
};
```

### 5.3 更新 AI 服务主类

修改：`webapp/backend/src/services/ai.service.ts`

```typescript
import axios, { AxiosInstance } from 'axios';
import { aiConfig, GenerateImageOptions, GenerateImageResult, RecognizeImageResult } from '../config/ai';
import { PicCopilotService } from './piccopilot.service';
import { ReplicateService } from './replicate.service';

class AIService {
  private client: AxiosInstance;
  private config = aiConfig;
  private picCopilotService?: PicCopilotService;
  private replicateService?: ReplicateService;

  constructor() {
    this.client = axios.create({
      baseURL: this.config.endpoint,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // 根据 provider 初始化对应的服务
    if (this.config.provider === 'piccopilot' && this.config.apiKey) {
      this.picCopilotService = new PicCopilotService({
        apiKey: this.config.apiKey,
        endpoint: this.config.endpoint,
        timeout: this.config.timeout,
      });
    } else if (this.config.provider === 'replicate' && this.config.apiKey) {
      this.replicateService = new ReplicateService({
        apiToken: this.config.apiKey,
        timeout: this.config.timeout,
      });
    }
  }

  // ... existing code ...

  /**
   * 生成穿搭效果图（组合用户照片和服装）
   */
  async generateOutfitImage(
    userPhotoUrl: string,
    clothingUrls: string[],
    options?: Partial<GenerateImageOptions>
  ): Promise<GenerateImageResult> {
    // 如果使用 Replicate，调用专用方法
    if (this.replicateService) {
      return this.replicateService.generateOutfitImage(
        userPhotoUrl,
        clothingUrls,
        options
      );
    }

    // 如果使用 Pic Copilot，调用专用方法
    if (this.picCopilotService) {
      return this.picCopilotService.generateOutfitImage(
        userPhotoUrl,
        clothingUrls,
        {
          resolution: options?.width && options?.height 
            ? `${options.width}x${options.height}` 
            : '1024x1024',
          quality: 'high',
        }
      );
    }

    // 否则使用通用方法（兼容其他 API）
    const prompt = this.buildOutfitPrompt(userPhotoUrl, clothingUrls, options);
    return this.generateImage({
      prompt,
      ...options,
    });
  }

  // ... existing code ...
}

export const aiService = new AIService();
```

### 5.4 更新环境变量示例

修改：`webapp/backend/ENV.example`

```env
# AI 服务提供商 (piccopilot | replicate | aliyun | default)
AI_PROVIDER=replicate

# Replicate API 配置
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REPLICATE_TIMEOUT=60000

# Pic Copilot API 配置（备选）
PIC_COPILOT_API_KEY=
PIC_COPILOT_API_ENDPOINT=
PIC_COPILOT_TIMEOUT=60000

# 通用 AI API 配置（备选）
AI_API_KEY=
AI_API_ENDPOINT=
AI_TIMEOUT=60000
```

---

## 6. API 调用示例

### 6.1 基本调用示例

```typescript
import { aiService } from './services/ai.service';

// 生成穿搭效果图
const result = await aiService.generateOutfitImage(
  'https://example.com/user-photo.jpg',  // 用户照片 URL
  [
    'https://example.com/clothing1.jpg',  // 服装1
    'https://example.com/clothing2.jpg',  // 服装2
  ],
  {
    width: 1024,
    height: 1024,
    style: 'casual',
  }
);

if (result.success) {
  console.log('生成成功！图片 URL:', result.imageUrl);
} else {
  console.error('生成失败：', result.error);
}
```

### 6.2 在路由中使用

修改：`webapp/backend/src/routes/outfit.routes.ts`

```typescript
import { Router } from 'express';
import { aiService } from '../services/ai.service';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    const { userPhotoId, clothingIds } = req.body;

    // 验证输入
    if (!userPhotoId || !clothingIds || !Array.isArray(clothingIds) || clothingIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userPhotoId and clothingIds',
      });
    }

    // 获取用户照片 URL
    const userPhoto = await getUserPhotoById(userPhotoId);
    if (!userPhoto) {
      return res.status(404).json({
        success: false,
        error: 'User photo not found',
      });
    }

    // 获取服装 URL
    const clothingItems = await getClothingItemsByIds(clothingIds);
    if (clothingItems.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Clothing items not found',
      });
    }

    const clothingUrls = clothingItems.map(item => item.image_url);

    // 调用 AI 服务生成穿搭效果图
    const result = await aiService.generateOutfitImage(
      userPhoto.image_url,
      clothingUrls,
      {
        width: 1024,
        height: 1024,
      }
    );

    if (result.success) {
      // 保存生成结果到数据库
      const outfitResult = await saveOutfitResult({
        userPhotoId,
        clothingIds,
        resultImageUrl: result.imageUrl,
      });

      return res.json({
        success: true,
        data: outfitResult,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate outfit',
      });
    }
  } catch (error: any) {
    console.error('Outfit generation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
```

---

## 7. 成本说明

### 7.1 计费方式

Replicate 按**实际使用时间**计费，不是按图片数量：

- **计费单位**：GPU 秒（GPU-seconds）
- **计费周期**：按实际运行时间
- **价格**：根据模型不同，约 $0.0001-0.001/秒

### 7.2 成本估算

**示例**：
- 生成一张 1024x1024 的图片，通常需要 **5-15 秒**
- 成本：约 **$0.0005-0.015**（约 ￥0.0035-0.105）

**月成本估算**：
- 月生成 1,000 张：约 ￥3.5-105
- 月生成 10,000 张：约 ￥35-1,050
- 月生成 100,000 张：约 ￥350-10,500

### 7.3 免费额度

- **首次注册**：赠送 $10 免费额度
- **约可生成**：600-3,000 张图片（取决于模型）

### 7.4 查看使用情况

1. 访问：https://replicate.com/account/billing
2. 查看当前使用量
3. 查看剩余额度
4. 设置预算提醒

---

## 8. 常见问题

### Q1：API Token 在哪里获取？

**A**：访问 https://replicate.com/account/api-tokens，点击 "Create token" 创建。

### Q2：如何选择合适的模型？

**A**：
1. 访问 https://replicate.com/explore
2. 搜索关键词：`virtual try-on`、`outfit`、`ControlNet`
3. 查看模型文档和示例
4. 测试不同模型的效果

### Q3：API 调用失败怎么办？

**A**：
1. 检查 API Token 是否正确
2. 检查网络连接
3. 查看错误信息
4. 检查模型输入参数是否正确
5. 查看 Replicate 状态：https://status.replicate.com

### Q4：如何优化成本？

**A**：
1. **缓存结果**：相同输入复用结果
2. **批量处理**：批量处理请求
3. **选择合适模型**：不同模型成本不同
4. **设置预算**：在账户中设置预算提醒

### Q5：支持哪些图片格式？

**A**：
- **输入**：JPG、PNG、WebP
- **输出**：PNG（通常）

### Q6：如何提高生成质量？

**A**：
1. 使用高质量的输入图片
2. 调整 `num_inference_steps`（更多步数 = 更高质量，但更慢更贵）
3. 调整 `guidance_scale`（通常 7.5-15）
4. 使用专门的虚拟试衣模型

### Q7：API 调用有时间限制吗？

**A**：
- **同步调用**：通常 60 秒超时
- **异步调用**：支持长时间运行的任务
- 可以在代码中设置 `timeout` 参数

### Q8：如何监控 API 使用？

**A**：
1. 访问：https://replicate.com/account/billing
2. 查看使用统计
3. 设置预算提醒
4. 使用 Replicate 的 Webhook 功能

---

## 9. 下一步

1. ✅ 注册 Replicate 账号
2. ✅ 获取 API Token
3. ✅ 配置环境变量
4. ✅ 测试 API 连接
5. ✅ 选择合适的模型
6. ✅ 集成到项目
7. ✅ 测试生成效果
8. ✅ 监控成本和使用情况

---

## 10. 相关资源

- **官网**：https://replicate.com/
- **文档**：https://replicate.com/docs
- **模型库**：https://replicate.com/explore
- **API Tokens**：https://replicate.com/account/api-tokens
- **账单**：https://replicate.com/account/billing
- **状态**：https://status.replicate.com
- **社区**：https://replicate.com/community

---

**最后更新**：2025-01-22  
**状态**：完整指南，可直接使用


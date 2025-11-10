# Pic Copilot API 集成指南

## 一、准备工作

### 1.1 注册 Pic Copilot 账号

1. **访问官网**：https://www.piccopilot.com/home
2. **注册账号**：使用邮箱注册
3. **登录后台**：进入开发者中心或 API 管理页面
4. **获取 API Key**：在设置中生成 API 密钥

### 1.2 查看 API 文档

访问官方文档页面：https://www.piccopilot.com/zh/learn

**注意**：Pic Copilot 的 API 文档可能需要登录后查看，请确保已注册并登录。

---

## 二、API 接口说明（基于常见虚拟试衣 API 模式）

### 2.1 虚拟试衣接口

**接口地址**：`https://api.piccopilot.com/v1/virtual-try-on`（示例，需确认实际地址）

**请求方法**：`POST`

**请求头**：
```json
{
  "Authorization": "Bearer YOUR_API_KEY",
  "Content-Type": "application/json"
}
```

**请求参数**（示例）：
```json
{
  "person_image_url": "https://example.com/person.jpg",
  "garment_image_url": "https://example.com/garment.jpg",
  "options": {
    "resolution": "1024x1024",
    "quality": "high"
  }
}
```

**响应格式**（示例）：
```json
{
  "success": true,
  "data": {
    "result_image_url": "https://example.com/result.jpg",
    "task_id": "task_123456",
    "status": "completed"
  }
}
```

**错误响应**：
```json
{
  "success": false,
  "error": {
    "code": "INVALID_IMAGE",
    "message": "Invalid image format"
  }
}
```

---

## 三、项目集成步骤

### 3.1 配置环境变量

在 `webapp/backend/.env` 文件中添加：

```env
# Pic Copilot API 配置
PIC_COPILOT_API_KEY=your_api_key_here
PIC_COPILOT_API_ENDPOINT=https://api.piccopilot.com/v1
PIC_COPILOT_TIMEOUT=60000
```

### 3.2 更新 AI 配置

修改 `webapp/backend/src/config/ai.ts`：

```typescript
export interface AIServiceConfig {
  apiKey: string;
  endpoint: string;
  timeout: number;
  retryCount: number;
  provider: 'piccopilot' | 'replicate' | 'aliyun'; // 添加提供商类型
}

export const aiConfig: AIServiceConfig = {
  apiKey: process.env.PIC_COPILOT_API_KEY || process.env.AI_API_KEY || '',
  endpoint: process.env.PIC_COPILOT_API_ENDPOINT || process.env.AI_API_ENDPOINT || '',
  timeout: parseInt(process.env.PIC_COPILOT_TIMEOUT || '60000'), // 60秒，虚拟试衣可能需要更长时间
  retryCount: 3,
  provider: (process.env.AI_PROVIDER || 'piccopilot') as 'piccopilot' | 'replicate' | 'aliyun',
};
```

### 3.3 创建 Pic Copilot 服务实现

创建新文件 `webapp/backend/src/services/piccopilot.service.ts`：

```typescript
import axios, { AxiosInstance } from 'axios';
import { GenerateImageResult } from '../config/ai';

export interface PicCopilotConfig {
  apiKey: string;
  endpoint: string;
  timeout: number;
}

export interface PicCopilotTryOnRequest {
  person_image_url: string;
  garment_image_url: string;
  options?: {
    resolution?: string;
    quality?: 'low' | 'medium' | 'high';
  };
}

export class PicCopilotService {
  private client: AxiosInstance;
  private config: PicCopilotConfig;

  constructor(config: PicCopilotConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.endpoint,
      timeout: config.timeout,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * 虚拟试衣（单件服装）
   */
  async virtualTryOn(
    personImageUrl: string,
    garmentImageUrl: string,
    options?: PicCopilotTryOnRequest['options']
  ): Promise<GenerateImageResult> {
    try {
      const response = await this.client.post('/virtual-try-on', {
        person_image_url: personImageUrl,
        garment_image_url: garmentImageUrl,
        options: options || {
          resolution: '1024x1024',
          quality: 'high',
        },
      });

      if (response.data.success && response.data.data?.result_image_url) {
        return {
          imageUrl: response.data.data.result_image_url,
          success: true,
        };
      }

      throw new Error(response.data.error?.message || 'Failed to generate image');
    } catch (error: any) {
      console.error('Pic Copilot API error:', error.response?.data || error.message);
      return {
        imageUrl: '',
        success: false,
        error: error.response?.data?.error?.message || error.message || 'Failed to generate image',
      };
    }
  }

  /**
   * 批量虚拟试衣（多件服装）
   */
  async batchVirtualTryOn(
    personImageUrl: string,
    garmentImageUrls: string[],
    options?: PicCopilotTryOnRequest['options']
  ): Promise<GenerateImageResult[]> {
    const results: GenerateImageResult[] = [];
    
    // 如果 API 支持批量，使用批量接口；否则串行处理
    for (const garmentUrl of garmentImageUrls) {
      const result = await this.virtualTryOn(personImageUrl, garmentUrl, options);
      results.push(result);
    }

    return results;
  }

  /**
   * 组合多件服装的虚拟试衣
   * 注意：Pic Copilot 可能不支持多件服装同时试穿，需要先合成服装图片
   */
  async generateOutfitImage(
    personImageUrl: string,
    garmentImageUrls: string[],
    options?: PicCopilotTryOnRequest['options']
  ): Promise<GenerateImageResult> {
    // 如果只有一件服装，直接调用单件接口
    if (garmentImageUrls.length === 1) {
      return this.virtualTryOn(personImageUrl, garmentImageUrls[0], options);
    }

    // 如果有多件服装，可能需要：
    // 1. 先合成服装图片（如果 API 支持）
    // 2. 或者多次调用，逐步叠加
    // 3. 或者使用其他方法
    
    // 这里先尝试使用第一件服装（实际实现需要根据 API 文档调整）
    console.warn('Multiple garments detected, using first garment only. Full support may require API update.');
    return this.virtualTryOn(personImageUrl, garmentImageUrls[0], options);
  }
}
```

### 3.4 更新 AI 服务以支持 Pic Copilot

修改 `webapp/backend/src/services/ai.service.ts`：

```typescript
import axios, { AxiosInstance } from 'axios';
import { aiConfig, GenerateImageOptions, GenerateImageResult, RecognizeImageResult } from '../config/ai';
import { PicCopilotService } from './piccopilot.service';

class AIService {
  private client: AxiosInstance;
  private config = aiConfig;
  private picCopilotService?: PicCopilotService;

  constructor() {
    this.client = axios.create({
      baseURL: this.config.endpoint,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // 如果使用 Pic Copilot，初始化专用服务
    if (this.config.provider === 'piccopilot' && this.config.apiKey) {
      this.picCopilotService = new PicCopilotService({
        apiKey: this.config.apiKey,
        endpoint: this.config.endpoint,
        timeout: this.config.timeout,
      });
    }
  }

  /**
   * 生成穿搭效果图（组合用户照片和服装）
   */
  async generateOutfitImage(
    userPhotoUrl: string,
    clothingUrls: string[],
    options?: Partial<GenerateImageOptions>
  ): Promise<GenerateImageResult> {
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

  // ... 其他方法保持不变 ...
}

export const aiService = new AIService();
```

---

## 四、测试集成

### 4.1 创建测试脚本

创建 `webapp/backend/scripts/test-piccopilot.ts`：

```typescript
import { PicCopilotService } from '../src/services/piccopilot.service';

async function testPicCopilot() {
  const service = new PicCopilotService({
    apiKey: process.env.PIC_COPILOT_API_KEY || '',
    endpoint: process.env.PIC_COPILOT_API_ENDPOINT || 'https://api.piccopilot.com/v1',
    timeout: 60000,
  });

  // 测试数据
  const personImageUrl = 'https://example.com/person.jpg';
  const garmentImageUrl = 'https://example.com/garment.jpg';

  console.log('Testing Pic Copilot API...');
  console.log('Person image:', personImageUrl);
  console.log('Garment image:', garmentImageUrl);

  const result = await service.virtualTryOn(personImageUrl, garmentImageUrl);

  if (result.success) {
    console.log('✅ Success!');
    console.log('Result image URL:', result.imageUrl);
  } else {
    console.error('❌ Failed:', result.error);
  }
}

testPicCopilot().catch(console.error);
```

### 4.2 运行测试

```bash
cd webapp/backend
npm run ts-node scripts/test-piccopilot.ts
```

---

## 五、前端集成

### 5.1 更新前端 API 调用

前端代码已经通过后端 API 调用，无需修改。只需要确保后端正确配置即可。

### 5.2 测试前端功能

1. 启动前后端服务
2. 登录系统
3. 上传用户照片
4. 选择服装
5. 点击"生成穿搭"
6. 查看生成结果

---

## 六、错误处理和重试

### 6.1 常见错误码

| 错误码 | 说明 | 处理方式 |
|--------|------|---------|
| `INVALID_API_KEY` | API 密钥无效 | 检查环境变量配置 |
| `INVALID_IMAGE` | 图片格式无效 | 验证图片 URL 和格式 |
| `IMAGE_TOO_LARGE` | 图片过大 | 压缩图片或使用更小的分辨率 |
| `RATE_LIMIT_EXCEEDED` | 请求频率超限 | 实现请求队列，控制请求频率 |
| `SERVER_ERROR` | 服务器错误 | 重试机制 |

### 6.2 实现重试机制

Pic Copilot 服务已经包含了错误处理，AI 服务的基础重试机制也会生效。

---

## 七、成本监控

### 7.1 记录 API 调用

在 `webapp/backend/src/controllers/outfit.controller.ts` 中已经实现了使用日志记录，可以监控 API 调用次数。

### 7.2 成本估算

- **免费方案**：目前 Pic Copilot 免费，无需成本
- **付费方案**：如果未来收费，需要根据实际定价调整

---

## 八、注意事项

### 8.1 API 限制

1. **请求频率**：注意 API 的请求频率限制
2. **图片大小**：确保图片 URL 可访问，大小适中
3. **超时设置**：虚拟试衣可能需要较长时间，建议设置 60 秒超时

### 8.2 多件服装处理

Pic Copilot 可能不支持同时试穿多件服装，需要：
1. 先合成服装图片
2. 或者多次调用，逐步叠加
3. 或者只使用第一件服装（当前实现）

### 8.3 图片 URL 要求

- 图片 URL 必须可公开访问
- 支持常见图片格式（JPG、PNG）
- 建议图片大小不超过 10MB

---

## 九、部署检查清单

- [ ] 注册 Pic Copilot 账号
- [ ] 获取 API Key
- [ ] 配置环境变量（`.env` 文件）
- [ ] 更新代码文件
- [ ] 运行测试脚本
- [ ] 测试前端功能
- [ ] 监控 API 调用和错误
- [ ] 准备备选方案（如果免费政策变更）

---

## 十、获取帮助

如果遇到问题：

1. **查看官方文档**：https://www.piccopilot.com/zh/learn
2. **联系技术支持**：通过官网联系客服
3. **检查日志**：查看后端日志了解详细错误信息

---

**文档更新时间**：2025-01-22  
**注意**：Pic Copilot 的 API 接口可能随时更新，请以官方最新文档为准



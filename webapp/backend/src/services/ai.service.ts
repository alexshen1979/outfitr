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

    // 如果使用 Replicate，初始化专用服务
    if (this.config.provider === 'replicate' && this.config.apiKey) {
      this.replicateService = new ReplicateService({
        apiToken: this.config.apiKey,
        timeout: this.config.timeout,
      });
    }
    // 如果使用 Pic Copilot，初始化专用服务
    else if (this.config.provider === 'piccopilot' && this.config.apiKey) {
      this.picCopilotService = new PicCopilotService({
        apiKey: this.config.apiKey,
        endpoint: this.config.endpoint,
        timeout: this.config.timeout,
      });
    }
  }

  /**
   * 生成图像（穿搭效果图）
   */
  async generateImage(options: GenerateImageOptions): Promise<GenerateImageResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.retryCount; attempt++) {
      try {
        // 这里需要根据实际的API聚合平台接口文档调整
        // 示例：假设API聚合平台提供标准接口
        const response = await this.client.post('/generate/image', {
          prompt: options.prompt,
          negative_prompt: options.negativePrompt,
          width: options.width || 512,
          height: options.height || 512,
          steps: options.steps || 20,
          guidance: options.guidance || 7.5,
        });

        if (response.data.success && response.data.data?.image_url) {
          return {
            imageUrl: response.data.data.image_url,
            success: true,
          };
        }

        throw new Error(response.data.error || 'Failed to generate image');
      } catch (error: any) {
        lastError = error;
        console.warn(`AI API call attempt ${attempt + 1} failed:`, error.message);

        // 如果不是最后一次尝试，等待后重试
        if (attempt < this.config.retryCount - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    return {
      imageUrl: '',
      success: false,
      error: lastError?.message || 'Failed to generate image after retries',
    };
  }

  /**
   * 识别图像（服装识别）
   */
  async recognizeImage(imageUrl: string): Promise<RecognizeImageResult> {
    try {
      // 这里需要根据实际的API聚合平台接口文档调整
      const response = await this.client.post('/recognize/image', {
        image_url: imageUrl,
      });

      if (response.data.success) {
        return {
          labels: response.data.data.labels || [],
          colors: response.data.data.colors,
          style: response.data.data.style,
          category: response.data.data.category,
        };
      }

      throw new Error(response.data.error || 'Failed to recognize image');
    } catch (error: any) {
      console.error('Image recognition error:', error);
      return {
        labels: [],
        error: error.message || 'Failed to recognize image',
      };
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

  /**
   * 构建穿搭提示词
   */
  private buildOutfitPrompt(
    userPhotoUrl: string,
    clothingUrls: string[],
    options?: Partial<GenerateImageOptions>
  ): string {
    // 这里构建一个描述性的提示词
    // 实际实现中，可能需要使用ControlNet或其他技术来精确控制
    const basePrompt = 'A realistic photo of a person wearing an outfit combination';
    const clothingDescription = clothingUrls.length > 0 
      ? `with ${clothingUrls.length} clothing items` 
      : '';
    
    return `${basePrompt} ${clothingDescription}, high quality, detailed, professional photography`;
  }
}

export const aiService = new AIService();


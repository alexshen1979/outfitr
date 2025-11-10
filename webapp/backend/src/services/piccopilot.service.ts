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
    let lastError: any = null;

    // 实现重试机制
    for (let attempt = 0; attempt < 3; attempt++) {
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
        lastError = error;
        console.warn(`Pic Copilot API call attempt ${attempt + 1} failed:`, error.response?.data || error.message);

        // 如果不是最后一次尝试，等待后重试
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    return {
      imageUrl: '',
      success: false,
      error: lastError?.response?.data?.error?.message || lastError?.message || 'Failed to generate image',
    };
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
    
    // 串行处理每件服装
    for (const garmentUrl of garmentImageUrls) {
      const result = await this.virtualTryOn(personImageUrl, garmentUrl, options);
      results.push(result);
    }

    return results;
  }

  /**
   * 生成穿搭效果图（组合用户照片和服装）
   * 注意：Pic Copilot 可能不支持多件服装同时试穿
   * 当前实现：如果有多件服装，使用第一件；实际使用时可能需要先合成服装图片
   */
  async generateOutfitImage(
    personImageUrl: string,
    garmentImageUrls: string[],
    options?: PicCopilotTryOnRequest['options']
  ): Promise<GenerateImageResult> {
    if (garmentImageUrls.length === 0) {
      return {
        imageUrl: '',
        success: false,
        error: 'No garment images provided',
      };
    }

    // 如果只有一件服装，直接调用
    if (garmentImageUrls.length === 1) {
      return this.virtualTryOn(personImageUrl, garmentImageUrls[0], options);
    }

    // 如果有多件服装，使用第一件（实际实现可能需要根据 API 文档调整）
    // 或者可以实现服装图片合成逻辑
    console.warn(`Multiple garments detected (${garmentImageUrls.length}), using first garment only. Full support may require API update or image composition.`);
    return this.virtualTryOn(personImageUrl, garmentImageUrls[0], options);
  }
}



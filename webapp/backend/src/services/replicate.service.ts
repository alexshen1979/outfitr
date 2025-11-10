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
    this.timeout = config.timeout || 120000; // 默认120秒
  }

  /**
   * 生成穿搭效果图（使用 IP-Adapter 模型）
   */
  async generateOutfitImage(
    userPhotoUrl: string,
    clothingUrls: string[],
    options?: Partial<GenerateImageOptions>
  ): Promise<GenerateImageResult> {
    try {
      // 使用 IP-Adapter 模型进行虚拟试衣
      // 模型: lucataco/ip-adapter - 支持图像到图像的生成
      const output = await this.replicate.run(
        'lucataco/ip-adapter:5a5277b4f1e0470510e403d3b26bc452f99a0d84',
        {
          input: {
            image: userPhotoUrl,
            prompt: this.buildOutfitPrompt(clothingUrls, options),
            num_outputs: 1,
            guidance_scale: options?.guidance || 7.5,
            num_inference_steps: options?.steps || 25,
            ...(options?.width && options?.height && {
              width: options.width,
              height: options.height,
            }),
          },
        }
      );

      // Replicate 返回的可能是字符串 URL 或数组
      const imageUrl = Array.isArray(output) ? output[0] : output;
      
      if (typeof imageUrl === 'string' && (imageUrl.startsWith('http') || imageUrl.startsWith('https'))) {
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
    const negativePrompt = options?.negativePrompt || 'blurry, low quality, distorted, deformed';
    
    return `${basePrompt} ${clothingDescription}${stylePrompt}, ${negativePrompt}`;
  }
}


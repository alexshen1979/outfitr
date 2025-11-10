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
  timeout: parseInt(process.env.REPLICATE_TIMEOUT || process.env.PIC_COPILOT_TIMEOUT || process.env.AI_TIMEOUT || '120000'), // 默认120秒（Replicate生成需要更长时间）
  retryCount: 3,
  provider: (process.env.AI_PROVIDER || 'replicate') as 'piccopilot' | 'replicate' | 'aliyun' | 'default',
};

export interface GenerateImageOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidance?: number;
  style?: string;
}

export interface GenerateImageResult {
  imageUrl: string;
  success: boolean;
  error?: string;
}

export interface RecognizeImageResult {
  labels: Array<{ label: string; confidence: number }>;
  colors?: string[];
  style?: string;
  category?: string;
  error?: string;
}


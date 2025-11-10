import { Request, Response } from 'express';
import { UserModel } from '../services/user.service';
import { UserPhotoModel } from '../models/user-photo';
import { WardrobeItemModel } from '../models/wardrobe-item';
import { OutfitResultModel } from '../models/outfit-result';
import { APIUsageLogModel } from '../models/api-usage-log';
import { aiService } from '../services/ai.service';

const FREE_USER_DAILY_LIMIT = 3;

export class OutfitController {
  // 生成穿搭效果
  static async generate(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      const { user_photo_id, clothing_ids, style } = req.body;

      // 验证用户存在
      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }

      // 检查免费用户使用限制
      if (user.role === 'free') {
        const todayUsage = await APIUsageLogModel.getTodayUsage(userId, 'outfit_generate');
        if (todayUsage >= FREE_USER_DAILY_LIMIT) {
          res.status(403).json({
            success: false,
            error: {
              code: 'USAGE_LIMIT_EXCEEDED',
              message: `Daily limit reached. Free users can generate ${FREE_USER_DAILY_LIMIT} outfits per day. Please upgrade to premium for unlimited generations.`,
            },
          });
          return;
        }
      }

      // 验证用户照片
      let userPhotoUrl = '';
      if (user_photo_id) {
        const userPhoto = await UserPhotoModel.findById(user_photo_id);
        if (!userPhoto || userPhoto.user_id !== userId) {
          res.status(404).json({
            success: false,
            error: {
              code: 'PHOTO_NOT_FOUND',
              message: 'User photo not found',
            },
          });
          return;
        }
        userPhotoUrl = userPhoto.photo_url;
      }

      // 验证服装
      const clothingUrls: string[] = [];
      if (clothing_ids && Array.isArray(clothing_ids) && clothing_ids.length > 0) {
        for (const clothingId of clothing_ids) {
          const item = await WardrobeItemModel.findByUserIdAndId(userId, clothingId);
          if (!item) {
            res.status(404).json({
              success: false,
              error: {
                code: 'CLOTHING_NOT_FOUND',
                message: `Clothing item ${clothingId} not found`,
              },
            });
            return;
          }
          clothingUrls.push(item.image_url);
        }
      }

      // 构建完整的图片URL（如果需要）
      const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
      const fullUserPhotoUrl = userPhotoUrl.startsWith('http') 
        ? userPhotoUrl 
        : `${baseUrl}${userPhotoUrl}`;
      const fullClothingUrls = clothingUrls.map(url => 
        url.startsWith('http') ? url : `${baseUrl}${url}`
      );

      // 调用AI服务生成穿搭效果图
      const aiResult = await aiService.generateOutfitImage(
        fullUserPhotoUrl,
        fullClothingUrls,
        { prompt: `Generate outfit combination`, style }
      );

      if (!aiResult.success || !aiResult.imageUrl) {
        res.status(500).json({
          success: false,
          error: {
            code: 'AI_GENERATION_FAILED',
            message: aiResult.error || 'Failed to generate outfit image',
          },
        });
        return;
      }

      // 保存结果到数据库
      const outfitResult = await OutfitResultModel.create({
        user_id: userId,
        result_image_url: aiResult.imageUrl,
        input_user_photo_id: user_photo_id || undefined,
        input_clothing_ids: clothing_ids || undefined,
        style: style || undefined,
      });

      // 更新使用日志
      await APIUsageLogModel.incrementUsage(userId, 'outfit_generate');

      res.json({
        success: true,
        data: {
          id: outfitResult.id,
          result_image_url: outfitResult.result_image_url,
          created_at: outfitResult.created_at,
        },
      });
    } catch (error: any) {
      console.error('Generate outfit error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate outfit',
        },
      });
    }
  }

  // 获取穿搭历史
  static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const results = await OutfitResultModel.findByUserId(userId, limit);

      res.json({
        success: true,
        data: results,
      });
    } catch (error: any) {
      console.error('Get outfit history error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get outfit history',
        },
      });
    }
  }
}


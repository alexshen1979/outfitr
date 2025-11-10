import { Request, Response } from 'express';
import { WardrobeItemModel } from '../models/wardrobe-item';
import { UserModel } from '../services/user.service';

const FREE_USER_WARDROBE_LIMIT = 50;

export class WardrobeController {
  // 添加物品
  static async createItem(req: Request, res: Response): Promise<void> {
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

      const { name, image_url, category, tags, season, style } = req.body;

      if (!image_url) {
        res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Image URL is required',
          },
        });
        return;
      }

      // 检查免费用户物品数量限制
      const user = await UserModel.findById(userId);
      if (user && user.role === 'free') {
        const currentCount = await WardrobeItemModel.countByUserId(userId);
        if (currentCount >= FREE_USER_WARDROBE_LIMIT) {
          res.status(403).json({
            success: false,
            error: {
              code: 'WARDROBE_LIMIT_EXCEEDED',
              message: `Free users can have up to ${FREE_USER_WARDROBE_LIMIT} items. Please upgrade to premium for unlimited storage.`,
            },
          });
          return;
        }
      }

      const item = await WardrobeItemModel.create({
        user_id: userId,
        name,
        image_url,
        category,
        tags,
        season,
        style,
      });

      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error: any) {
      console.error('Create wardrobe item error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create wardrobe item',
        },
      });
    }
  }

  // 获取衣柜列表
  static async getItems(req: Request, res: Response): Promise<void> {
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

      const items = await WardrobeItemModel.findByUserId(userId);

      // 解析tags JSON
      const itemsWithParsedTags = items.map((item) => ({
        ...item,
        tags: item.tags ? JSON.parse(item.tags) : null,
      }));

      res.json({
        success: true,
        data: itemsWithParsedTags,
      });
    } catch (error: any) {
      console.error('Get wardrobe items error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get wardrobe items',
        },
      });
    }
  }

  // 更新物品
  static async updateItem(req: Request, res: Response): Promise<void> {
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

      const { id } = req.params;
      const { name, image_url, category, tags, season, style } = req.body;

      const item = await WardrobeItemModel.findByUserIdAndId(userId, parseInt(id));
      if (!item) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Wardrobe item not found',
          },
        });
        return;
      }

      const updatedItem = await WardrobeItemModel.update(parseInt(id), userId, {
        name,
        image_url,
        category,
        tags,
        season,
        style,
      });

      if (!updatedItem) {
        res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update wardrobe item',
          },
        });
        return;
      }

      // 解析tags JSON
      const itemWithParsedTags = {
        ...updatedItem,
        tags: updatedItem.tags ? JSON.parse(updatedItem.tags) : null,
      };

      res.json({
        success: true,
        data: itemWithParsedTags,
      });
    } catch (error: any) {
      console.error('Update wardrobe item error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update wardrobe item',
        },
      });
    }
  }

  // 删除物品
  static async deleteItem(req: Request, res: Response): Promise<void> {
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

      const { id } = req.params;

      const deleted = await WardrobeItemModel.delete(parseInt(id), userId);
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Wardrobe item not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        message: 'Wardrobe item deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete wardrobe item error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete wardrobe item',
        },
      });
    }
  }
}


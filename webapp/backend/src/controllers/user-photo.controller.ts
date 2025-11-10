import { Request, Response } from 'express';
import { UserPhotoModel } from '../models/user-photo';

export class UserPhotoController {
  // 创建用户照片
  static async create(req: Request, res: Response): Promise<void> {
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

      const { photo_url, photo_type } = req.body;

      if (!photo_url) {
        res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Photo URL is required',
          },
        });
        return;
      }

      const photo = await UserPhotoModel.create({
        user_id: userId,
        photo_url,
        photo_type: photo_type || 'body',
      });

      res.status(201).json({
        success: true,
        data: photo,
      });
    } catch (error: any) {
      console.error('Create user photo error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create user photo',
        },
      });
    }
  }

  // 获取用户照片列表
  static async getPhotos(req: Request, res: Response): Promise<void> {
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

      const photoType = req.query.type as 'avatar' | 'body' | undefined;
      const photos = await UserPhotoModel.findByUserId(userId, photoType);

      res.json({
        success: true,
        data: photos,
      });
    } catch (error: any) {
      console.error('Get user photos error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get user photos',
        },
      });
    }
  }

  // 删除用户照片
  static async deletePhoto(req: Request, res: Response): Promise<void> {
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
      const photo = await UserPhotoModel.findById(parseInt(id));

      if (!photo || photo.user_id !== userId) {
        res.status(404).json({
          success: false,
          error: {
            code: 'PHOTO_NOT_FOUND',
            message: 'Photo not found',
          },
        });
        return;
      }

      await UserPhotoModel.delete(parseInt(id));

      res.json({
        success: true,
        message: 'Photo deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete user photo error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete photo',
        },
      });
    }
  }
}


import { Router } from 'express';
import { UserPhotoController } from '../controllers/user-photo.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// 创建用户照片
router.post('/', authenticateToken, UserPhotoController.create);

// 获取用户照片列表
router.get('/', authenticateToken, UserPhotoController.getPhotos);

// 删除用户照片
router.delete('/:id', authenticateToken, UserPhotoController.deletePhoto);

export default router;


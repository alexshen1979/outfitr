import { Router } from 'express';
import { WardrobeController } from '../controllers/wardrobe.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// 添加物品
router.post('/items', authenticateToken, WardrobeController.createItem);

// 获取衣柜列表
router.get('/items', authenticateToken, WardrobeController.getItems);

// 更新物品
router.put('/items/:id', authenticateToken, WardrobeController.updateItem);

// 删除物品
router.delete('/items/:id', authenticateToken, WardrobeController.deleteItem);

export default router;


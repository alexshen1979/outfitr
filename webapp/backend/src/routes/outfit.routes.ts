import { Router } from 'express';
import { OutfitController } from '../controllers/outfit.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// 生成穿搭效果
router.post('/generate', authenticateToken, OutfitController.generate);

// 获取穿搭历史
router.get('/history', authenticateToken, OutfitController.getHistory);

export default router;


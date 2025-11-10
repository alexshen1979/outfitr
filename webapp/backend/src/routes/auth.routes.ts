import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// 用户注册
router.post('/register', AuthController.register);

// 用户登录
router.post('/login', AuthController.login);

// 获取当前用户信息（需要认证）
router.get('/me', authenticateToken, AuthController.getCurrentUser);

export default router;


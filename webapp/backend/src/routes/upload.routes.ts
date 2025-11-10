import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';

const router = Router();

// 单图片上传接口
router.post('/image', UploadController.uploadSingle);

// 多图片上传接口
router.post('/images', UploadController.uploadMultiple);

export default router;


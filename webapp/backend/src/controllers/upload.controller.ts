import { Request, Response } from 'express';
import { upload, validateImageFile, getFileUrl } from '../config/upload';
import { authenticateToken } from '../middleware/auth.middleware';

export class UploadController {
  // 单文件上传
  static uploadSingle = [
    authenticateToken,
    upload.single('image'),
    async (req: Request, res: Response): Promise<void> => {
      try {
        if (!req.file) {
          res.status(400).json({
            success: false,
            error: {
              code: 'NO_FILE',
              message: 'No file uploaded',
            },
          });
          return;
        }

        // 额外验证文件类型
        if (!validateImageFile(req.file)) {
          // 删除已上传的文件
          const fs = require('fs');
          fs.unlinkSync(req.file.path);

          res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_FILE_TYPE',
              message: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
            },
          });
          return;
        }

        const uploadType = (req.body.type || 'wardrobe') as string;
        const fileUrl = getFileUrl(req.file, uploadType);

        res.json({
          success: true,
          data: {
            url: fileUrl,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
          },
        });
      } catch (error: any) {
        console.error('Upload error:', error);

        // 如果是文件大小超限错误
        if (error.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({
            success: false,
            error: {
              code: 'FILE_TOO_LARGE',
              message: 'File size exceeds the maximum limit of 10MB',
            },
          });
          return;
        }

        res.status(500).json({
          success: false,
          error: {
            code: 'UPLOAD_FAILED',
            message: 'Failed to upload file',
          },
        });
      }
    },
  ];

  // 多文件上传
  static uploadMultiple = [
    authenticateToken,
    upload.array('images', 20), // 最多20个文件
    async (req: Request, res: Response): Promise<void> => {
      try {
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
          res.status(400).json({
            success: false,
            error: {
              code: 'NO_FILES',
              message: 'No files uploaded',
            },
          });
          return;
        }

        const files = req.files as Express.Multer.File[];
        const uploadType = (req.body.type || 'wardrobe') as string;
        const fs = require('fs');
        const results: any[] = [];
        const errors: any[] = [];

        // 处理每个文件
        for (const file of files) {
          // 验证文件类型
          if (!validateImageFile(file)) {
            // 删除无效文件
            fs.unlinkSync(file.path);
            errors.push({
              filename: file.originalname,
              error: 'Invalid file type',
            });
            continue;
          }

          const fileUrl = getFileUrl(file, uploadType);
          results.push({
            url: fileUrl,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
          });
        }

        res.json({
          success: true,
          data: {
            files: results,
            errors: errors.length > 0 ? errors : undefined,
          },
        });
      } catch (error: any) {
        console.error('Multiple upload error:', error);

        res.status(500).json({
          success: false,
          error: {
            code: 'UPLOAD_FAILED',
            message: 'Failed to upload files',
          },
        });
      }
    },
  ];
}


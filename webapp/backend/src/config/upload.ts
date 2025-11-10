import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// 上传目录配置
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// 允许的文件类型
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// 确保上传目录存在
function ensureUploadDirs() {
  const dirs = [
    UPLOAD_DIR,
    path.join(UPLOAD_DIR, 'avatars'),
    path.join(UPLOAD_DIR, 'wardrobe'),
    path.join(UPLOAD_DIR, 'outfit-results'),
    path.join(UPLOAD_DIR, 'user-photos'),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// 初始化目录
ensureUploadDirs();

// 文件过滤器
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // 检查MIME类型
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
  }
};

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 根据上传类型决定存储目录
    // multer 在处理文件时，req.body 可能还未解析，所以优先使用 query 参数
    const uploadType = (req.query?.type || req.body?.type || 'wardrobe') as string;
    
    // 调试日志
    console.log(`[Upload] File: ${file.originalname}, Type: ${uploadType}, Query:`, req.query, 'Body:', req.body);
    
    // 统一目录名映射（确保与ensureUploadDirs中的目录名一致）
    const dirMap: Record<string, string> = {
      'wardrobe': 'wardrobe',
      'avatar': 'avatars',
      'user-photo': 'user-photos', // 统一使用复数形式
      'outfit-result': 'outfit-results',
    };
    
    const dirName = dirMap[uploadType] || uploadType;
    let uploadPath = path.join(UPLOAD_DIR, dirName);

    // 确保目录存在
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    console.log(`[Upload] Saving to: ${uploadPath}`);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 使用UUID生成唯一文件名，保留原始扩展名
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// 创建multer实例
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// 验证文件类型（额外检查）
export function validateImageFile(file: Express.Multer.File): boolean {
  // 检查扩展名
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return false;
  }

  // 检查MIME类型
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return false;
  }

  return true;
}

// 获取文件URL（用于返回给前端）
export function getFileUrl(file: Express.Multer.File, uploadType: string): string {
  const filename = file.filename;
  
  // 统一目录名映射（确保与storage中的目录名一致）
  const dirMap: Record<string, string> = {
    'wardrobe': 'wardrobe',
    'avatar': 'avatars',
    'user-photo': 'user-photos', // 统一使用复数形式
    'outfit-result': 'outfit-results',
  };
  
  const dirName = dirMap[uploadType] || uploadType;
  return `/uploads/${dirName}/${filename}`;
}


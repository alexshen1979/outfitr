import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { testConnection } from './config/database';
import authRoutes from './routes/auth.routes';
import uploadRoutes from './routes/upload.routes';
import aiRoutes from './routes/ai.routes';
import outfitRoutes from './routes/outfit.routes';
import wardrobeRoutes from './routes/wardrobe.routes';
import userPhotoRoutes from './routes/user-photo.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（用于访问上传的图片）
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const uploadDirPath = path.resolve(process.cwd(), UPLOAD_DIR);
console.log(`📁 Upload directory: ${uploadDirPath}`);
app.use('/uploads', express.static(uploadDirPath));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'OUTFITR Backend API is running' });
});

// API routes
app.get('/api/v1', (req: Request, res: Response) => {
  res.json({ message: 'OUTFITR API v1' });
});

// Authentication routes
app.use('/api/v1/auth', authRoutes);

// Upload routes
app.use('/api/v1/upload', uploadRoutes);

// AI routes
app.use('/api/v1/ai', aiRoutes);

// Outfit routes
app.use('/api/v1/outfit', outfitRoutes);

// Wardrobe routes
app.use('/api/v1/wardrobe', wardrobeRoutes);

// User photo routes
app.use('/api/v1/user/photos', userPhotoRoutes);

// Start server
async function startServer() {
  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.warn('⚠️  Database connection failed. Make sure MySQL is running and configured.');
  } else {
    console.log('✅ Database connected successfully');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/v1/auth`);
    console.log(`📤 Upload endpoints: http://localhost:${PORT}/api/v1/upload`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});


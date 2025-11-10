import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserModel } from '../services/user.service';
import { JWTService } from '../utils/jwt';

// 验证邮箱格式
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 验证密码强度（至少8位）
function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export class AuthController {
  // 用户注册
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, nickname } = req.body;

      // 验证输入
      if (!email || !password) {
        res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required',
          },
        });
        return;
      }

      if (!isValidEmail(email)) {
        res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email format',
          },
        });
        return;
      }

      if (!isValidPassword(password)) {
        res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Password must be at least 8 characters long',
          },
        });
        return;
      }

      // 检查邮箱是否已存在
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        res.status(400).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Email already registered',
          },
        });
        return;
      }

      // 加密密码
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // 创建用户
      const user = await UserModel.create({
        email,
        password_hash,
        nickname: nickname || null,
      });

      // 生成JWT token
      const token = JWTService.generateToken({
        userId: user.id,
        email: user.email,
      });

      // 返回用户信息（不包含密码）
      const userWithoutPassword = UserModel.removePassword(user);

      res.status(201).json({
        success: true,
        data: {
          token,
          user: userWithoutPassword,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      
      // 详细错误日志
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // 检查是否是数据库连接错误
      if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
        res.status(503).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database connection failed. Please check your database configuration.',
          },
        });
        return;
      }

      // 检查是否是数据库表不存在错误
      if (error instanceof Error && error.message.includes("doesn't exist")) {
        res.status(500).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database table not found. Please run the database initialization script.',
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to register user. Please try again later.',
        },
      });
    }
  }

  // 用户登录
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // 验证输入
      if (!email || !password) {
        res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required',
          },
        });
        return;
      }

      // 查找用户
      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
        return;
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
        return;
      }

      // 生成JWT token
      const token = JWTService.generateToken({
        userId: user.id,
        email: user.email,
      });

      // 返回用户信息（不包含密码）
      const userWithoutPassword = UserModel.removePassword(user);

      res.json({
        success: true,
        data: {
          token,
          user: userWithoutPassword,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to login',
        },
      });
    }
  }

  // 获取当前用户信息
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
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

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }

      // 返回用户信息（不包含密码）
      const userWithoutPassword = UserModel.removePassword(user);

      res.json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get user information',
        },
      });
    }
  }
}


import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: number;
  email: string;
}

export class JWTService {
  private static readonly SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  private static readonly EXPIRES_IN = '7d';

  // 生成JWT token
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.SECRET, {
      expiresIn: this.EXPIRES_IN,
    });
  }

  // 验证JWT token
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}


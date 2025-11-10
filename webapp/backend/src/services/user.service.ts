import { pool } from '../config/database';
import { User, CreateUserData, UserWithoutPassword } from '../models/user';

export class UserModel {
  // 根据邮箱查找用户
  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }

  // 根据ID查找用户
  static async findById(id: number): Promise<User | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }

  // 创建新用户
  static async create(userData: CreateUserData): Promise<User> {
    const { email, password_hash, nickname } = userData;
    
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)',
      [email, password_hash, nickname || null]
    );

    const insertResult = result as any;
    const user = await this.findById(insertResult.insertId);
    
    if (!user) {
      throw new Error('Failed to create user');
    }

    return user;
  }

  // 移除密码字段的用户对象
  static removePassword(user: User): UserWithoutPassword {
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}


import { pool } from '../config/database';

export interface APIUsageLog {
  id: number;
  user_id: number;
  api_type: string;
  request_count: number;
  date: Date;
  created_at: Date;
}

export class APIUsageLogModel {
  static async getTodayUsage(userId: number, apiType: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];

    const [rows] = await pool.execute(
      'SELECT request_count FROM api_usage_logs WHERE user_id = ? AND api_type = ? AND date = ?',
      [userId, apiType, today]
    );

    const logs = rows as APIUsageLog[];
    return logs.length > 0 ? logs[0].request_count : 0;
  }

  static async incrementUsage(userId: number, apiType: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // 尝试更新现有记录
    const [updateResult] = await pool.execute(
      'UPDATE api_usage_logs SET request_count = request_count + 1 WHERE user_id = ? AND api_type = ? AND date = ?',
      [userId, apiType, today]
    );

    // 如果没有更新任何行，插入新记录
    if ((updateResult as any).affectedRows === 0) {
      await pool.execute(
        'INSERT INTO api_usage_logs (user_id, api_type, request_count, date) VALUES (?, ?, 1, ?)',
        [userId, apiType, today]
      );
    }
  }
}


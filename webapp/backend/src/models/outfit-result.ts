import { pool } from '../config/database';

export interface OutfitResult {
  id: number;
  user_id: number;
  result_image_url: string;
  input_user_photo_id: number | null;
  input_clothing_ids: string | null; // JSON string
  style: string | null;
  created_at: Date;
}

export interface CreateOutfitResultData {
  user_id: number;
  result_image_url: string;
  input_user_photo_id?: number;
  input_clothing_ids?: number[];
  style?: string;
}

export class OutfitResultModel {
  static async findByUserId(userId: number, limit: number = 50): Promise<OutfitResult[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM outfit_results WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );
    return rows as OutfitResult[];
  }

  static async findById(id: number): Promise<OutfitResult | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM outfit_results WHERE id = ?',
      [id]
    );
    const results = rows as OutfitResult[];
    return results.length > 0 ? results[0] : null;
  }

  static async create(data: CreateOutfitResultData): Promise<OutfitResult> {
    const { user_id, result_image_url, input_user_photo_id, input_clothing_ids, style } = data;

    const [result] = await pool.execute(
      'INSERT INTO outfit_results (user_id, result_image_url, input_user_photo_id, input_clothing_ids, style) VALUES (?, ?, ?, ?, ?)',
      [
        user_id,
        result_image_url,
        input_user_photo_id || null,
        input_clothing_ids ? JSON.stringify(input_clothing_ids) : null,
        style || null,
      ]
    );

    const insertResult = result as any;
    const outfitResult = await this.findById(insertResult.insertId);

    if (!outfitResult) {
      throw new Error('Failed to create outfit result');
    }

    return outfitResult;
  }
}


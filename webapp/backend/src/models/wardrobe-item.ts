import { pool } from '../config/database';

export interface WardrobeItem {
  id: number;
  user_id: number;
  name: string | null;
  image_url: string;
  category: string | null;
  tags: string | null; // JSON string
  season: string | null;
  style: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateWardrobeItemData {
  user_id: number;
  name?: string;
  image_url: string;
  category?: string;
  tags?: string[];
  season?: string;
  style?: string;
}

export class WardrobeItemModel {
  static async findByUserId(userId: number): Promise<WardrobeItem[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM wardrobe_items WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows as WardrobeItem[];
  }

  static async findById(id: number): Promise<WardrobeItem | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM wardrobe_items WHERE id = ?',
      [id]
    );
    const items = rows as WardrobeItem[];
    return items.length > 0 ? items[0] : null;
  }

  static async findByUserIdAndId(userId: number, id: number): Promise<WardrobeItem | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM wardrobe_items WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    const items = rows as WardrobeItem[];
    return items.length > 0 ? items[0] : null;
  }

  static async countByUserId(userId: number): Promise<number> {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM wardrobe_items WHERE user_id = ?',
      [userId]
    );
    const result = rows as any[];
    return result[0].count;
  }

  static async create(data: CreateWardrobeItemData): Promise<WardrobeItem> {
    const { user_id, name, image_url, category, tags, season, style } = data;

    const [result] = await pool.execute(
      'INSERT INTO wardrobe_items (user_id, name, image_url, category, tags, season, style) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        user_id,
        name || null,
        image_url,
        category || null,
        tags ? JSON.stringify(tags) : null,
        season || null,
        style || null,
      ]
    );

    const insertResult = result as any;
    const item = await this.findById(insertResult.insertId);

    if (!item) {
      throw new Error('Failed to create wardrobe item');
    }

    return item;
  }

  static async update(id: number, userId: number, data: Partial<CreateWardrobeItemData>): Promise<WardrobeItem | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name || null);
    }
    if (data.image_url !== undefined) {
      updates.push('image_url = ?');
      values.push(data.image_url || null);
    }
    if (data.category !== undefined) {
      updates.push('category = ?');
      values.push(data.category || null);
    }
    if (data.tags !== undefined) {
      updates.push('tags = ?');
      values.push(data.tags ? JSON.stringify(data.tags) : null);
    }
    if (data.season !== undefined) {
      updates.push('season = ?');
      values.push(data.season || null);
    }
    if (data.style !== undefined) {
      updates.push('style = ?');
      values.push(data.style || null);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id, userId);

    const [result] = await pool.execute(
      `UPDATE wardrobe_items SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id: number, userId: number): Promise<boolean> {
    const [result] = await pool.execute(
      'DELETE FROM wardrobe_items WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return (result as any).affectedRows > 0;
  }
}


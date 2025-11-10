import { pool } from '../config/database';

export interface UserPhoto {
  id: number;
  user_id: number;
  photo_url: string;
  photo_type: 'avatar' | 'body';
  is_active: boolean;
  created_at: Date;
}

export interface CreateUserPhotoData {
  user_id: number;
  photo_url: string;
  photo_type?: 'avatar' | 'body';
}

export class UserPhotoModel {
  static async findByUserId(userId: number, photoType?: 'avatar' | 'body'): Promise<UserPhoto[]> {
    let query = 'SELECT * FROM user_photos WHERE user_id = ?';
    const params: any[] = [userId];

    if (photoType) {
      query += ' AND photo_type = ?';
      params.push(photoType);
    }

    query += ' AND is_active = true ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows as UserPhoto[];
  }

  static async findById(id: number): Promise<UserPhoto | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM user_photos WHERE id = ?',
      [id]
    );
    const photos = rows as UserPhoto[];
    return photos.length > 0 ? photos[0] : null;
  }

  static async create(data: CreateUserPhotoData): Promise<UserPhoto> {
    const { user_id, photo_url, photo_type = 'body' } = data;

    const [result] = await pool.execute(
      'INSERT INTO user_photos (user_id, photo_url, photo_type) VALUES (?, ?, ?)',
      [user_id, photo_url, photo_type]
    );

    const insertResult = result as any;
    const photo = await this.findById(insertResult.insertId);

    if (!photo) {
      throw new Error('Failed to create user photo');
    }

    return photo;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute(
      'UPDATE user_photos SET is_active = false WHERE id = ?',
      [id]
    );
    return (result as any).affectedRows > 0;
  }
}


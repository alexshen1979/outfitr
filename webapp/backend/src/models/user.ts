export interface User {
  id: number;
  email: string;
  password_hash: string;
  nickname: string | null;
  avatar: string | null;
  role: 'free' | 'premium' | 'vip';
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password_hash: string;
  nickname?: string;
}

export interface UserWithoutPassword {
  id: number;
  email: string;
  nickname: string | null;
  avatar: string | null;
  role: 'free' | 'premium' | 'vip';
  created_at: Date;
  updated_at: Date;
}


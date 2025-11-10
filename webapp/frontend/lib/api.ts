import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加token到请求头
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // 如果上传文件，删除Content-Type让浏览器自动设置
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理401错误（token过期）
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // 可以在这里添加重定向到登录页的逻辑
      }
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  email: string;
  nickname: string | null;
  avatar: string | null;
  role: 'free' | 'premium' | 'vip';
  created_at: string;
  updated_at: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nickname?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

// ... existing code ...

// 认证API
export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<{ success: boolean; data: User }> => {
    const response = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
    return response.data;
  },
};

// 衣柜API
export interface WardrobeItem {
  id: number;
  user_id: number;
  name: string | null;
  image_url: string;
  category: string | null;
  tags: string[] | null;
  season: string | null;
  style: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWardrobeItemData {
  name?: string;
  image_url: string;
  category?: string;
  tags?: string[];
  season?: string;
  style?: string;
}

export const wardrobeAPI = {
  getItems: async (): Promise<{ success: boolean; data: WardrobeItem[] }> => {
    const response = await apiClient.get<{ success: boolean; data: WardrobeItem[] }>('/wardrobe/items');
    return response.data;
  },

  createItem: async (data: CreateWardrobeItemData): Promise<{ success: boolean; data: WardrobeItem }> => {
    const response = await apiClient.post<{ success: boolean; data: WardrobeItem }>('/wardrobe/items', data);
    return response.data;
  },

  updateItem: async (id: number, data: Partial<CreateWardrobeItemData>): Promise<{ success: boolean; data: WardrobeItem }> => {
    const response = await apiClient.put<{ success: boolean; data: WardrobeItem }>(`/wardrobe/items/${id}`, data);
    return response.data;
  },

  deleteItem: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/wardrobe/items/${id}`);
    return response.data;
  },
};

// 用户照片API
export interface UserPhoto {
  id: number;
  user_id: number;
  photo_url: string;
  photo_type: 'avatar' | 'body';
  is_active: boolean;
  created_at: string;
}

export const userPhotoAPI = {
  getPhotos: async (type?: 'avatar' | 'body'): Promise<{ success: boolean; data: UserPhoto[] }> => {
    const params = type ? `?type=${type}` : '';
    const response = await apiClient.get<{ success: boolean; data: UserPhoto[] }>(`/user/photos${params}`);
    return response.data;
  },

  createPhoto: async (photo_url: string, photo_type?: 'avatar' | 'body'): Promise<{ success: boolean; data: UserPhoto }> => {
    const response = await apiClient.post<{ success: boolean; data: UserPhoto }>('/user/photos', {
      photo_url,
      photo_type: photo_type || 'body',
    });
    return response.data;
  },

  deletePhoto: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/user/photos/${id}`);
    return response.data;
  },
};

// 穿搭API
export interface OutfitResult {
  id: number;
  user_id: number;
  result_image_url: string;
  input_user_photo_id: number | null;
  input_clothing_ids: number[] | null;
  style: string | null;
  created_at: string;
}

export interface GenerateOutfitData {
  user_photo_id?: number;
  clothing_ids?: number[];
  style?: string;
}

export const outfitAPI = {
  generate: async (data: GenerateOutfitData): Promise<{ success: boolean; data: { id: number; result_image_url: string; created_at: string } }> => {
    const response = await apiClient.post<{ success: boolean; data: { id: number; result_image_url: string; created_at: string } }>('/outfit/generate', data);
    return response.data;
  },

  getHistory: async (limit?: number): Promise<{ success: boolean; data: OutfitResult[] }> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get<{ success: boolean; data: OutfitResult[] }>(`/outfit/history${params}`);
    return response.data;
  },
};

// 上传API
export interface UploadFileResult {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

export const uploadAPI = {
  uploadSingle: async (file: File, uploadType: string = 'wardrobe'): Promise<{ success: boolean; data: UploadFileResult }> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', uploadType);
    // 同时使用 query 参数，因为 multer destination 函数执行时 req.body 可能还未解析
    const response = await apiClient.post<{ success: boolean; data: UploadFileResult }>(`/upload/image?type=${uploadType}`, formData);
    return response.data;
  },

  uploadMultiple: async (files: File[], uploadType: string = 'wardrobe'): Promise<{ success: boolean; data: { files: UploadFileResult[]; errors?: Array<{ filename: string; error: string }> } }> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    formData.append('type', uploadType);
    // 同时使用 query 参数，因为 multer destination 函数执行时 req.body 可能还未解析
    const response = await apiClient.post<{ success: boolean; data: { files: UploadFileResult[]; errors?: Array<{ filename: string; error: string }> } }>(`/upload/images?type=${uploadType}`, formData);
    return response.data;
  },
};


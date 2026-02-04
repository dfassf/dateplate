import axios from 'axios';
import type { LoginRequest, LoginResponse, RegisterRequest, ApiResponse } from '@dateplate/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: 401 에러 시 토큰 제거 및 리다이렉트
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Couple 타입
export interface CoupleResponse {
  id: string;
  name: string | null;
  profileUrl: string | null;
  user1: { id: string; email: string; name: string };
  user2: { id: string; email: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface InviteResponse {
  inviteCode: string;
  expiresAt: string;
}

export interface PendingInvite {
  id: string;
  inviteCode: string;
  coupleName: string | null;
  expiresAt: string;
}

// Couples API
export const couplesApi = {
  createInvite: async (coupleName?: string): Promise<InviteResponse> => {
    const response = await api.post<ApiResponse<InviteResponse>>('/couples/invite', { coupleName });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || '초대 코드 생성 실패');
  },

  acceptInvite: async (inviteCode: string): Promise<CoupleResponse> => {
    const response = await api.post<ApiResponse<CoupleResponse>>('/couples/accept', { inviteCode });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || '초대 수락 실패');
  },

  getMyCouple: async (): Promise<CoupleResponse | null> => {
    const response = await api.get<ApiResponse<CoupleResponse | null>>('/couples/me');
    if (response.data.success) {
      return response.data.data || null;
    }
    throw new Error(response.data.error || '커플 정보 조회 실패');
  },

  getMyPendingInvite: async (): Promise<PendingInvite | null> => {
    const response = await api.get<ApiResponse<PendingInvite | null>>('/couples/invite/pending');
    if (response.data.success) {
      return response.data.data || null;
    }
    throw new Error(response.data.error || '초대 조회 실패');
  },
};

// Restaurant 타입
export interface Restaurant {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
}

// Restaurants API
export const restaurantsApi = {
  search: async (query: string, limit?: number): Promise<Restaurant[]> => {
    const params = new URLSearchParams({ q: query });
    if (limit) params.append('limit', String(limit));
    const response = await api.get<ApiResponse<Restaurant[]>>(`/restaurants/search?${params}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || '식당 검색 실패');
  },

  create: async (data: { name: string; address?: string; category?: string }): Promise<Restaurant> => {
    const response = await api.post<ApiResponse<Restaurant>>('/restaurants', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || '식당 등록 실패');
  },
};

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', data);
    if (response.data.success && response.data.data) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      return response.data.data;
    }
    throw new Error(response.data.error || 'Login failed');
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/register', data);
    if (response.data.success && response.data.data) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      return response.data.data;
    }
    throw new Error(response.data.error || 'Registration failed');
  },

  logout: () => {
    localStorage.removeItem('accessToken');
  },
};

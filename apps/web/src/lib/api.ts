import axios from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ApiResponse,
  PaginatedResponse,
  Team,
  TeamMember,
  TeamInvite,
  DinnerRecord,
  Restaurant,
  Review,
} from '@hoesikplate/shared';

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: apiBaseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (data: LoginRequest) => api.post<ApiResponse<LoginResponse>>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<ApiResponse<LoginResponse>>('/auth/register', data),
};

export const teamApi = {
  create: (data: { name: string }) => api.post<ApiResponse<Team>>('/teams', data),
  getMyTeams: () => api.get<ApiResponse<Team[]>>('/teams/me'),
  getById: (id: string) => api.get<ApiResponse<Team & { members: TeamMember[] }>>(`/teams/${id}`),
  createInvite: (teamId: string) => api.post<ApiResponse<TeamInvite>>(`/teams/${teamId}/invite`),
  acceptInvite: (code: string) => api.post<ApiResponse<Team>>('/teams/invite/accept', { code }),
};

export const dinnerApi = {
  create: (data: { date: string; memo?: string; totalAmount?: number; headcount?: number; teamId: string; restaurantId: string }) =>
    api.post<ApiResponse<DinnerRecord>>('/dinners', data),
  getByTeam: (teamId: string, page = 1, limit = 20) =>
    api.get<PaginatedResponse<DinnerRecord>>(`/dinners/team/${teamId}`, { params: { page, limit } }),
  getById: (id: string) => api.get<ApiResponse<DinnerRecord>>(`/dinners/${id}`),
};

export const restaurantApi = {
  create: (data: { name: string; address?: string; category?: string; kakaoPlaceId?: string }) =>
    api.post<ApiResponse<Restaurant>>('/restaurants', data),
  search: (query?: string) => api.get<ApiResponse<Restaurant[]>>('/restaurants', { params: { search: query } }),
};

export const reviewApi = {
  create: (data: { content?: string; rating: number; dinnerRecordId: string; restaurantId: string; teamId: string }) =>
    api.post<ApiResponse<Review>>('/reviews', data),
  getByTeam: (teamId: string, page = 1, limit = 20) =>
    api.get<PaginatedResponse<Review>>(`/reviews/team/${teamId}`, { params: { page, limit } }),
};

export default api;

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
  User,
} from '@hoesikplate/shared';

const api = axios.create({
  baseURL: '/api',
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

export const userApi = {
  getMe: () => api.get<ApiResponse<User>>('/users/me'),
};

export const teamApi = {
  create: (data: { name: string }) => api.post<ApiResponse<Team>>('/teams', data),
  getMyTeams: () => api.get<ApiResponse<Team[]>>('/teams'),
  getById: (id: string) => api.get<ApiResponse<Team & { members: TeamMember[] }>>(`/teams/${id}`),
  createInvite: (teamId: string) => api.post<ApiResponse<TeamInvite>>(`/teams/${teamId}/invite`),
  acceptInvite: (code: string) => api.post<ApiResponse<Team>>('/teams/join', { inviteCode: code }),
};

export const dinnerApi = {
  create: (data: { date: string; memo?: string; totalAmount?: number; headcount?: number; teamId: string; restaurantId: string }) =>
    api.post<ApiResponse<DinnerRecord>>('/dinners', data),
  getByTeam: (teamId: string, page = 1, limit = 20) =>
    api.get<PaginatedResponse<DinnerRecord>>('/dinners', { params: { teamId, page, limit } }),
  getById: (id: string) => api.get<ApiResponse<DinnerRecord>>(`/dinners/${id}`),
  delete: (id: string) => api.delete<ApiResponse<{ deleted: boolean }>>(`/dinners/${id}`),
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
    api.get<PaginatedResponse<Review>>('/reviews', { params: { teamId, page, limit } }),
  delete: (id: string) => api.delete<ApiResponse<{ deleted: boolean }>>(`/reviews/${id}`),
};

export default api;

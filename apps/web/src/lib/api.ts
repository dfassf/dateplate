import axios from 'axios';
import type {
  Achievement,
  ApiResponse,
  DinnerRecord,
  LoginRequest,
  LoginResponse,
  Mission,
  PaginatedResponse,
  RegisterRequest,
  Restaurant,
  Review,
  Session,
  SessionOption,
  SessionVote,
  Team,
  TeamInvite,
  TeamMember,
  Ticket,
  TicketResultsResponse,
  User,
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

const unwrap = async <T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> => {
  const response = await request;
  return response.data.data;
};

const unwrapPaginated = async <T>(
  request: Promise<{ data: PaginatedResponse<T> }>,
): Promise<PaginatedResponse<T>> => {
  const response = await request;
  return response.data;
};

export const authApi = {
  login: (data: LoginRequest) =>
    unwrap(api.post<ApiResponse<LoginResponse>>('/auth/login', data)),
  register: (data: RegisterRequest) =>
    unwrap(api.post<ApiResponse<LoginResponse>>('/auth/register', data)),
  checkEmail: (email: string) =>
    unwrap(api.get<ApiResponse<{ available: boolean }>>('/auth/check-email', { params: { email } })),
};

export const userApi = {
  getMe: () => unwrap(api.get<ApiResponse<User>>('/users/me')),
  updateProfile: (data: {
    name?: string;
    companyAddress?: string;
    companyLatitude?: number;
    companyLongitude?: number;
  }) => unwrap(api.patch<ApiResponse<User>>('/users/me', data)),
};

export const teamApi = {
  create: (data: { name: string }) =>
    unwrap(api.post<ApiResponse<Team>>('/teams', data)),
  getMyTeams: () => unwrap(api.get<ApiResponse<Team[]>>('/teams')),
  getById: (id: string) =>
    unwrap(api.get<ApiResponse<Team & { members: TeamMember[] }>>(`/teams/${id}`)),
  update: (id: string, data: { name?: string }) =>
    unwrap(api.patch<ApiResponse<Team>>(`/teams/${id}`, data)),
  delete: (id: string) =>
    unwrap(api.delete<ApiResponse<{ deleted: boolean }>>(`/teams/${id}`)),
  createInvite: (teamId: string) =>
    unwrap(api.post<ApiResponse<TeamInvite>>(`/teams/${teamId}/invite`)),
  acceptInvite: (code: string) =>
    unwrap(api.post<ApiResponse<Team>>('/teams/join', { inviteCode: code })),
};

export const dinnerApi = {
  create: (data: {
    date: string;
    memo?: string;
    totalAmount?: number;
    headcount?: number;
    teamId: string;
    restaurantId: string;
  }) => unwrap(api.post<ApiResponse<DinnerRecord>>('/dinners', data)),
  getByTeam: (teamId: string, page = 1, limit = 20) =>
    unwrapPaginated(
      api.get<PaginatedResponse<DinnerRecord>>('/dinners', {
        params: { teamId, page, limit },
      }),
    ),
  getById: (id: string) =>
    unwrap(api.get<ApiResponse<DinnerRecord>>(`/dinners/${id}`)),
  getRecent: () =>
    unwrap(
      api.get<ApiResponse<{ recent: (DinnerRecord & { team?: Team })[]; thisMonthCount: number }>>(
        '/dinners/recent',
      ),
    ),
  delete: (id: string) =>
    unwrap(api.delete<ApiResponse<{ deleted: boolean }>>(`/dinners/${id}`)),
};

export const restaurantApi = {
  create: (data: {
    name: string;
    address?: string;
    category?: string;
    kakaoPlaceId?: string;
    latitude?: number;
    longitude?: number;
  }) => unwrap(api.post<ApiResponse<Restaurant>>('/restaurants', data)),
  search: (query?: string) =>
    unwrap(api.get<ApiResponse<Restaurant[]>>('/restaurants', { params: { search: query } })),
  getByTeam: (teamId: string, sort?: string) =>
    unwrap(
      api.get<ApiResponse<(Restaurant & { visitCount: number; avgRating: number })[]>>(
        `/restaurants/team/${teamId}`,
        { params: { sort } },
      ),
    ),
  getRankings: (sort?: string, category?: string) =>
    unwrap(
      api.get<ApiResponse<(Restaurant & { visitCount: number; reviewCount: number; avgRating: number })[]>>(
        '/restaurants/rankings',
        { params: { sort, category } },
      ),
    ),
};

export const reviewApi = {
  create: (data: {
    content?: string;
    rating: number;
    dinnerRecordId: string;
    restaurantId: string;
    teamId: string;
    tagNames?: string[];
    visibility?: string;
  }) => unwrap(api.post<ApiResponse<Review>>('/reviews', data)),
  getById: (id: string) => unwrap(api.get<ApiResponse<Review>>(`/reviews/${id}`)),
  getByTeam: (teamId: string, page = 1, limit = 20) =>
    unwrapPaginated(
      api.get<PaginatedResponse<Review>>('/reviews', {
        params: { teamId, page, limit },
      }),
    ),
  update: (
    id: string,
    data: {
      rating?: number;
      content?: string;
      visibility?: string;
      tagNames?: string[];
    },
  ) => unwrap(api.patch<ApiResponse<Review>>(`/reviews/${id}`, data)),
  delete: (id: string) =>
    unwrap(api.delete<ApiResponse<{ deleted: boolean }>>(`/reviews/${id}`)),
  getCommunity: (tag?: string, page = 1, limit = 20) =>
    unwrapPaginated(
      api.get<PaginatedResponse<Review>>('/reviews/community', {
        params: { tag, page, limit },
      }),
    ),
};

export const sessionApi = {
  create: (data: {
    type: 'TOURNAMENT' | 'ROULETTE';
    teamId: string;
    title?: string;
    options: { name: string; restaurantId?: string; weight?: number }[];
  }) => unwrap(api.post<ApiResponse<Session>>('/sessions', data)),
  getByTeam: (teamId: string, status?: string) =>
    unwrap(api.get<ApiResponse<Session[]>>('/sessions', { params: { teamId, status } })),
  getById: (id: string) =>
    unwrap(api.get<ApiResponse<Session & { options: SessionOption[] }>>(`/sessions/${id}`)),
  vote: (id: string, data: { optionId: string; round: number }) =>
    unwrap(api.post<ApiResponse<SessionVote>>(`/sessions/${id}/vote`, data)),
  spin: (id: string) =>
    unwrap(
      api.post<ApiResponse<{ winner: SessionOption; session: Session }>>(
        `/sessions/${id}/spin`,
      ),
    ),
  complete: (id: string, result: string) =>
    unwrap(api.post<ApiResponse<Session>>(`/sessions/${id}/complete`, { result })),
};

export const gamificationApi = {
  giveTicket: (data: { toUserId: string; teamId: string; type: 'GOLDEN' | 'BLACK' }) =>
    unwrap(api.post<ApiResponse<Ticket>>('/gamification/tickets', data)),
  getTicketResults: (teamId: string, month?: number, year?: number) =>
    unwrap(
      api.get<ApiResponse<TicketResultsResponse>>(`/gamification/tickets/${teamId}`, {
        params: { month, year },
      }),
    ),
  getAchievements: () =>
    unwrap(api.get<ApiResponse<Achievement[]>>('/gamification/achievements')),
  checkAchievements: () =>
    unwrap(api.post<ApiResponse<Achievement[]>>('/gamification/achievements/check')),
  getMissions: () => unwrap(api.get<ApiResponse<Mission[]>>('/gamification/missions')),
};

export const statsApi = {
  getTeamStats: (teamId: string) =>
    unwrap(
      api.get<
        ApiResponse<{
          totalDinners: number;
          totalAmount: number;
          avgPerPerson: number;
          monthlySpending: { month: string; amount: number; count: number }[];
          categoryDistribution: { category: string; count: number }[];
          memberParticipation: { name: string; count: number }[];
          totalReviews: number;
          avgRating: number;
        }>
      >(`/stats/${teamId}`),
    ),
};

export default api;

// ==================== Auth ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// ==================== User ====================

export interface User {
  id: string;
  email: string;
  name: string;
  companyAddress: string | null;
  companyLatitude: number | null;
  companyLongitude: number | null;
  createdAt: string;
}

// ==================== Team ====================

export interface Team {
  id: string;
  name: string;
  profileUrl: string | null;
  leaderId: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  user: User;
}

export type TeamRole = 'LEADER' | 'MEMBER';

// ==================== Team Invite ====================

export interface TeamInvite {
  id: string;
  inviteCode: string;
  teamId: string;
  status: TeamInviteStatus;
  expiresAt: string;
}

export type TeamInviteStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';

// ==================== Restaurant ====================

export interface Restaurant {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  kakaoPlaceId: string | null;
}

// ==================== Dinner Record ====================

export interface DinnerRecord {
  id: string;
  date: string;
  memo: string | null;
  totalAmount: number | null;
  headcount: number | null;
  teamId: string;
  restaurantId: string;
  createdBy: string;
  restaurant?: Restaurant;
  creator?: User;
  reviews?: Review[];
  createdAt: string;
}

// ==================== Review ====================

export interface Review {
  id: string;
  content: string | null;
  rating: number;
  isVerified: boolean;
  visibility: ReviewVisibility;
  dinnerRecordId: string;
  restaurantId: string;
  teamId: string;
  authorId: string;
  images?: ReviewImage[];
  tags?: ReviewTag[];
  restaurant?: Restaurant;
  author?: User;
  createdAt: string;
}

export type ReviewVisibility = 'PRIVATE' | 'COMMUNITY' | 'PUBLIC';

export interface ReviewImage {
  id: string;
  imageUrl: string;
  type: ReviewImageType;
}

export type ReviewImageType = 'RECEIPT' | 'PHOTO';

export interface ReviewTag {
  id: string;
  name: string;
}

// ==================== Session (Tournament / Roulette) ====================

export interface Session {
  id: string;
  type: SessionType;
  status: 'ACTIVE' | 'COMPLETED';
  title: string | null;
  result: string | null;
  teamId: string;
  creatorId: string;
  creator?: Pick<User, 'id' | 'name'>;
  options?: SessionOption[];
  createdAt: string;
}

export type SessionType = 'TOURNAMENT' | 'ROULETTE';

export interface SessionOption {
  id: string;
  name: string;
  weight: number;
  sessionId: string;
  restaurantId: string | null;
  restaurant?: Restaurant;
}

export interface SessionVote {
  id: string;
  round: number;
  sessionId: string;
  optionId: string;
  voterId: string;
}

// ==================== Gamification ====================

export interface Ticket {
  id: string;
  type: 'GOLDEN' | 'BLACK';
  teamId: string;
  fromUserId: string;
  toUserId: string;
  month: number;
  year: number;
  createdAt: string;
}

export interface TicketResult {
  golden: number;
  black: number;
}

export interface TicketResultsResponse {
  month: number;
  year: number;
  results: Record<string, TicketResult>;
}

export interface Achievement {
  code: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface Mission {
  id: string;
  code: string;
  title: string;
  description: string;
  targetCount: number;
  reward: string;
  isActive: boolean;
  currentCount: number;
  completed: boolean;
  completedAt: string | null;
}

// ==================== API ====================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

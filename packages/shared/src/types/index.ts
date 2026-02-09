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
  restaurant?: Restaurant;
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

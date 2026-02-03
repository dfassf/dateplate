// User
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Couple
export interface Couple {
  id: string;
  name: string | null;
  profileUrl: string | null;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Restaurant
export interface Restaurant {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// DateRecord
export interface DateRecord {
  id: string;
  date: Date;
  memo: string | null;
  amount: number | null;
  coupleId: string;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Review
export interface Review {
  id: string;
  content: string | null;
  rating: number;
  isVerified: boolean;
  visibility: ReviewVisibility;
  coupleId: string;
  restaurantId: string;
  dateRecordId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ReviewVisibility = 'PRIVATE' | 'COMMUNITY' | 'PUBLIC';
export type ReviewImageType = 'RECEIPT' | 'PHOTO';
export type CoupleInviteStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: Omit<User, 'createdAt' | 'updatedAt'>;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

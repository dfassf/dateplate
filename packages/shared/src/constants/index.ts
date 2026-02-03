// Review Visibility
export const REVIEW_VISIBILITY = {
  PRIVATE: 'PRIVATE',
  COMMUNITY: 'COMMUNITY',
  PUBLIC: 'PUBLIC',
} as const;

// Review Image Type
export const REVIEW_IMAGE_TYPE = {
  RECEIPT: 'RECEIPT',
  PHOTO: 'PHOTO',
} as const;

// Couple Invite Status
export const COUPLE_INVITE_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    ME: '/users/me',
    UPDATE: '/users/me',
  },
  COUPLES: {
    BASE: '/couples',
    INVITE: '/couples/invite',
    ACCEPT: '/couples/accept',
  },
  RESTAURANTS: {
    BASE: '/restaurants',
    SEARCH: '/restaurants/search',
  },
  DATE_RECORDS: {
    BASE: '/date-records',
  },
  REVIEWS: {
    BASE: '/reviews',
  },
} as const;

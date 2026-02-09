export const TEAM_ROLE = {
  LEADER: 'LEADER',
  MEMBER: 'MEMBER',
} as const;

export const TEAM_INVITE_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;

export const REVIEW_VISIBILITY = {
  PRIVATE: 'PRIVATE',
  COMMUNITY: 'COMMUNITY',
  PUBLIC: 'PUBLIC',
} as const;

export const REVIEW_IMAGE_TYPE = {
  RECEIPT: 'RECEIPT',
  PHOTO: 'PHOTO',
} as const;

export const DEFAULT_TAGS = [
  '단체회식좋은',
  '분위기좋은',
  '룸있는',
  '조용한',
  '2차하기좋은',
  '가성비좋은',
  '고급스러운',
  '주차편한',
  '역근처',
] as const;

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { couplesApi, restaurantsApi, authApi, api } from './api';
import type { AxiosResponse } from 'axios';

// axios mock
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    ...actual,
    default: {
      create: () => ({
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }),
    },
  };
});

describe('couplesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createInvite', () => {
    it('초대 코드 생성 성공 시 inviteCode와 expiresAt 반환', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            inviteCode: 'ABCD1234',
            expiresAt: '2025-12-31T23:59:59Z',
          },
        },
      };

      vi.spyOn(api, 'post').mockResolvedValueOnce(mockResponse as AxiosResponse);

      const result = await couplesApi.createInvite('테스트커플');

      expect(api.post).toHaveBeenCalledWith('/couples/invite', { coupleName: '테스트커플' });
      expect(result.inviteCode).toBe('ABCD1234');
      expect(result.expiresAt).toBe('2025-12-31T23:59:59Z');
    });

    it('초대 코드 생성 실패 시 에러 throw', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: '이미 커플로 등록되어 있습니다',
        },
      };

      vi.spyOn(api, 'post').mockResolvedValueOnce(mockResponse as AxiosResponse);

      await expect(couplesApi.createInvite()).rejects.toThrow('이미 커플로 등록되어 있습니다');
    });
  });

  describe('acceptInvite', () => {
    it('초대 수락 성공 시 커플 정보 반환', async () => {
      const mockCouple = {
        id: 'couple-1',
        name: '테스트커플',
        profileUrl: null,
        user1: { id: 'user-1', email: 'user1@test.com', name: '유저1' },
        user2: { id: 'user-2', email: 'user2@test.com', name: '유저2' },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const mockResponse = {
        data: {
          success: true,
          data: mockCouple,
        },
      };

      vi.spyOn(api, 'post').mockResolvedValueOnce(mockResponse as AxiosResponse);

      const result = await couplesApi.acceptInvite('ABCD1234');

      expect(api.post).toHaveBeenCalledWith('/couples/accept', { inviteCode: 'ABCD1234' });
      expect(result.id).toBe('couple-1');
      expect(result.user1.name).toBe('유저1');
    });

    it('잘못된 초대 코드 시 에러 throw', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: '유효하지 않은 초대 코드입니다',
        },
      };

      vi.spyOn(api, 'post').mockResolvedValueOnce(mockResponse as AxiosResponse);

      await expect(couplesApi.acceptInvite('INVALID1')).rejects.toThrow('유효하지 않은 초대 코드입니다');
    });
  });

  describe('getMyCouple', () => {
    it('커플 정보 조회 성공', async () => {
      const mockCouple = {
        id: 'couple-1',
        name: '테스트커플',
        profileUrl: null,
        user1: { id: 'user-1', email: 'user1@test.com', name: '유저1' },
        user2: { id: 'user-2', email: 'user2@test.com', name: '유저2' },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const mockResponse = {
        data: {
          success: true,
          data: mockCouple,
        },
      };

      vi.spyOn(api, 'get').mockResolvedValueOnce(mockResponse as AxiosResponse);

      const result = await couplesApi.getMyCouple();

      expect(api.get).toHaveBeenCalledWith('/couples/me');
      expect(result?.name).toBe('테스트커플');
    });

    it('커플이 없을 경우 null 반환', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: null,
        },
      };

      vi.spyOn(api, 'get').mockResolvedValueOnce(mockResponse as AxiosResponse);

      const result = await couplesApi.getMyCouple();

      expect(result).toBeNull();
    });
  });
});

describe('restaurantsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('search', () => {
    it('식당 검색 성공', async () => {
      const mockRestaurants = [
        { id: '1', name: '맛집1', address: '서울시', latitude: null, longitude: null, category: '한식' },
        { id: '2', name: '맛집2', address: '부산시', latitude: null, longitude: null, category: '양식' },
      ];

      const mockResponse = {
        data: {
          success: true,
          data: mockRestaurants,
        },
      };

      vi.spyOn(api, 'get').mockResolvedValueOnce(mockResponse as AxiosResponse);

      const result = await restaurantsApi.search('맛집');

      expect(api.get).toHaveBeenCalledWith('/restaurants/search?q=%EB%A7%9B%EC%A7%91');
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('맛집1');
    });
  });

  describe('create', () => {
    it('식당 등록 성공', async () => {
      const newRestaurant = { name: '새맛집', address: '서울시 강남구', category: '한식' };
      const mockResponse = {
        data: {
          success: true,
          data: { id: 'new-1', ...newRestaurant, latitude: null, longitude: null },
        },
      };

      vi.spyOn(api, 'post').mockResolvedValueOnce(mockResponse as AxiosResponse);

      const result = await restaurantsApi.create(newRestaurant);

      expect(api.post).toHaveBeenCalledWith('/restaurants', newRestaurant);
      expect(result.name).toBe('새맛집');
    });
  });
});

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    it('로그인 성공 시 토큰 저장 및 응답 반환', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            accessToken: 'test-token',
            user: { id: 'user-1', email: 'test@test.com', name: '테스트' },
          },
        },
      };

      vi.spyOn(api, 'post').mockResolvedValueOnce(mockResponse as AxiosResponse);

      const result = await authApi.login({ email: 'test@test.com', password: 'password' });

      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'test-token');
      expect(result.accessToken).toBe('test-token');
      expect(result.user.email).toBe('test@test.com');
    });
  });

  describe('logout', () => {
    it('로그아웃 시 토큰 제거', () => {
      authApi.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
    });
  });
});

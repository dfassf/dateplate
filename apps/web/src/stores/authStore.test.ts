import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@hoesikplate/shared';

const createLocalStorageMock = (): Storage => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: () => {
      store.clear();
    },
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
};

const mockUser: User = {
  id: 'user-1',
  email: 'user1@example.com',
  name: '테스트 유저',
  companyAddress: null,
  companyLatitude: null,
  companyLongitude: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('useAuthStore', () => {
  let useAuthStore: (typeof import('./authStore'))['useAuthStore'];

  beforeEach(async () => {
    const localStorageMock = createLocalStorageMock();
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      configurable: true,
      writable: true,
    });

    vi.resetModules();
    ({ useAuthStore } = await import('./authStore'));

    localStorage.clear();
    useAuthStore.setState({ user: null, token: null });
  });

  it('setAuth should update store and persist token to localStorage', () => {
    useAuthStore.getState().setAuth(mockUser, 'token-123');
    const state = useAuthStore.getState();

    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('token-123');
    expect(localStorage.getItem('token')).toBe('token-123');
  });

  it('updateUser should only update user', () => {
    useAuthStore.getState().setAuth(mockUser, 'token-123');

    const updatedUser: User = { ...mockUser, name: '수정된 이름' };
    useAuthStore.getState().updateUser(updatedUser);
    const state = useAuthStore.getState();

    expect(state.user).toEqual(updatedUser);
    expect(state.token).toBe('token-123');
  });

  it('logout should clear store and localStorage token', () => {
    useAuthStore.getState().setAuth(mockUser, 'token-123');

    useAuthStore.getState().logout();
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});

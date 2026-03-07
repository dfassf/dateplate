import { useEffect } from 'react';
import { userApi } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!token || user) {
      return;
    }

    userApi
      .getMe()
      .then((me) => {
        updateUser(me);
      })
      .catch(() => {
        logout();
      });
  }, [logout, token, updateUser, user]);
}

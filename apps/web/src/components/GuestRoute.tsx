import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function GuestRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Layout() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold" style={{ color: '#3182f6' }}>
            Hoesikplate
          </Link>
          <div className="flex gap-4 text-sm items-center">
            {token ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                  대시보드
                </Link>
                <span className="text-gray-400">{user?.name}</span>
                <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700">
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900">
                  로그인
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded-lg text-white text-sm"
                  style={{ backgroundColor: '#3182f6' }}
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

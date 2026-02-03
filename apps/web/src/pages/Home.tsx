import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        커플 미식 아카이빙 플랫폼
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        함께한 식당과 데이트를 기록하고 추억하세요
      </p>

      {isAuthenticated ? (
        <div className="mt-8">
          <p className="text-lg text-gray-700 mb-4">
            안녕하세요, {user?.name}님! 👋
          </p>
          <Link
            to="/dashboard"
            className="inline-block px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
          >
            대시보드로 이동
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-x-4">
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
          >
            로그인
          </Link>
          <Link
            to="/register"
            className="inline-block px-6 py-3 bg-white text-pink-600 border-2 border-pink-600 rounded-lg hover:bg-pink-50 transition"
          >
            회원가입
          </Link>
        </div>
      )}
    </div>
  );
}

import { useAuthStore } from '../stores/authStore';

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        대시보드
      </h1>
      <p className="text-gray-600">
        안녕하세요, {user?.name}님! 대시보드가 곧 업데이트됩니다.
      </p>
    </div>
  );
}

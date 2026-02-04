import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { couplesApi, type CoupleResponse } from '../lib/api';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [couple, setCouple] = useState<CoupleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCouple();
  }, []);

  const loadCouple = async () => {
    try {
      const coupleData = await couplesApi.getMyCouple();
      setCouple(coupleData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPartnerName = () => {
    if (!couple || !user) return '';
    return couple.user1.id === user.id ? couple.user2.name : couple.user1.name;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        안녕하세요, {user?.name}님!
      </h1>
      <p className="text-gray-600 mb-8">
        오늘도 맛있는 하루 되세요
      </p>

      {/* 커플 상태 카드 */}
      {couple ? (
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm mb-1">우리 커플</p>
              <h2 className="text-2xl font-bold">{couple.name || '💕'}</h2>
              <p className="text-pink-100 mt-2">
                {user?.name} & {getPartnerName()}
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">💑</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200 p-6 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💔</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              아직 커플이 아니시네요
            </h2>
            <p className="text-gray-500 mb-4">
              파트너와 연결하여 함께 데이트를 기록하세요
            </p>
            <Link
              to="/couple"
              className="inline-block px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
            >
              커플 연결하기
            </Link>
          </div>
        </div>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">총 데이트</span>
            <span className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">📅</span>
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-500 mt-1">회</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">방문 식당</span>
            <span className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">🍽️</span>
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-500 mt-1">곳</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">총 지출</span>
            <span className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">💰</span>
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-500 mt-1">원</p>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/restaurants"
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition group"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition">
              <span className="text-xl">🔍</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">식당 찾기</h3>
              <p className="text-sm text-gray-500">새로운 맛집을 발견하세요</p>
            </div>
          </div>
        </Link>

        <Link
          to="/dates"
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition group"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition">
              <span className="text-xl">✏️</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">데이트 기록</h3>
              <p className="text-sm text-gray-500">오늘의 데이트를 남겨보세요</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

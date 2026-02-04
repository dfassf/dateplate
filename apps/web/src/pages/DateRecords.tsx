import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { couplesApi, type CoupleResponse } from '../lib/api';

interface DateRecord {
  id: string;
  date: string;
  memo: string | null;
  amount: number | null;
  restaurant: {
    id: string;
    name: string;
    category: string | null;
  };
}

export default function DateRecords() {
  const [couple, setCouple] = useState<CoupleResponse | null>(null);
  const [dateRecords] = useState<DateRecord[]>([]);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!couple) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">💔</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          커플 연결이 필요합니다
        </h2>
        <p className="text-gray-600 mb-6">
          데이트를 기록하려면 먼저 파트너와 연결하세요
        </p>
        <Link
          to="/couple"
          className="inline-block px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
        >
          커플 연결하기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">데이트 기록</h1>
        <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition">
          + 새 기록
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-pink-600">{dateRecords.length}</div>
          <div className="text-sm text-gray-500">총 데이트</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-pink-600">
            {new Set(dateRecords.map((d) => d.restaurant.id)).size}
          </div>
          <div className="text-sm text-gray-500">방문 식당</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-pink-600">
            {dateRecords.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}원
          </div>
          <div className="text-sm text-gray-500">총 지출</div>
        </div>
      </div>

      {/* 데이트 기록 목록 */}
      {dateRecords.length > 0 ? (
        <div className="space-y-3">
          {dateRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {record.restaurant.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(record.date).toLocaleDateString('ko-KR')}
                  </p>
                  {record.memo && (
                    <p className="text-sm text-gray-600 mt-2">{record.memo}</p>
                  )}
                </div>
                <div className="text-right">
                  {record.restaurant.category && (
                    <span className="px-2 py-1 text-xs bg-pink-100 text-pink-700 rounded-full">
                      {record.restaurant.category}
                    </span>
                  )}
                  {record.amount && (
                    <p className="text-sm font-medium text-gray-700 mt-2">
                      {record.amount.toLocaleString()}원
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🍽️</span>
          </div>
          <p className="text-gray-500 mb-4">아직 기록된 데이트가 없습니다</p>
          <Link
            to="/restaurants"
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            식당 찾아보기 →
          </Link>
        </div>
      )}
    </div>
  );
}

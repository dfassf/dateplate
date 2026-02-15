import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dinnerApi } from '../lib/api';
import RestaurantSearch from '../components/RestaurantSearch';
import type { Restaurant } from '@hoesikplate/shared';

export default function DinnerCreate() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [memo, setMemo] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [headcount, setHeadcount] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !selectedRestaurant) {
      setError('식당을 선택해주세요.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await dinnerApi.create({
        date,
        memo: memo || undefined,
        totalAmount: totalAmount ? Number(totalAmount) : undefined,
        headcount: headcount ? Number(headcount) : undefined,
        teamId,
        restaurantId: selectedRestaurant.id,
      });
      navigate(`/teams/${teamId}`);
    } catch {
      setError('회식 기록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6">회식 기록하기</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 날짜 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#3182f6] text-sm"
          />
        </div>

        {/* 식당 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            식당 {selectedRestaurant && '✓'}
          </label>

          {selectedRestaurant ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{selectedRestaurant.name}</p>
                  {selectedRestaurant.address && (
                    <p className="text-sm text-gray-500 mt-1">{selectedRestaurant.address}</p>
                  )}
                  {selectedRestaurant.category && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-white text-gray-600 rounded">
                      {selectedRestaurant.category}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRestaurant(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <RestaurantSearch
              onSelect={handleRestaurantSelect}
              showCreateButton={true}
            />
          )}
        </div>

        {/* 인원 수 & 총 금액 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">인원 수</label>
            <input
              type="number"
              placeholder="예: 8"
              value={headcount}
              onChange={(e) => setHeadcount(e.target.value)}
              min={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#3182f6] text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">총 금액 (원)</label>
            <input
              type="number"
              placeholder="예: 450000"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              min={0}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#3182f6] text-sm"
            />
          </div>
        </div>

        {/* 인당 금액 표시 */}
        {headcount && totalAmount && Number(headcount) > 0 && Number(totalAmount) > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm">
            <span className="text-gray-600">인당 금액: </span>
            <span className="font-semibold text-blue-600">
              {Math.round(Number(totalAmount) / Number(headcount)).toLocaleString()}원
            </span>
          </div>
        )}

        {/* 메모 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
          <textarea
            placeholder="신입 환영회, 분기 회식 등"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#3182f6] text-sm resize-none"
          />
        </div>

        {/* 에러 메시지 */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={loading || !selectedRestaurant}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#3182f6' }}
        >
          {loading ? '저장 중...' : '회식 기록 저장'}
        </button>
      </form>
    </div>
  );
}

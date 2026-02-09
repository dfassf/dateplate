import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dinnerApi, restaurantApi } from '../lib/api';
import type { Restaurant } from '@hoesikplate/shared';

export default function DinnerCreate() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [memo, setMemo] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [headcount, setHeadcount] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [newRestName, setNewRestName] = useState('');
  const [newRestAddr, setNewRestAddr] = useState('');
  const [showNewRest, setShowNewRest] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    restaurantApi.search().then((res) => setRestaurants(res.data.data)).catch(() => {});
  }, []);

  const handleCreateRestaurant = async () => {
    if (!newRestName.trim()) return;
    try {
      const res = await restaurantApi.create({ name: newRestName, address: newRestAddr || undefined });
      const created = res.data.data;
      setRestaurants((prev) => [created, ...prev]);
      setRestaurantId(created.id);
      setShowNewRest(false);
      setNewRestName('');
      setNewRestAddr('');
    } catch {
      setError('식당 등록에 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !restaurantId) {
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
        restaurantId,
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
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">식당</label>
            <button
              type="button"
              onClick={() => setShowNewRest(!showNewRest)}
              className="text-xs font-medium"
              style={{ color: '#3182f6' }}
            >
              {showNewRest ? '기존 식당 선택' : '+ 새 식당 등록'}
            </button>
          </div>
          {showNewRest ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="식당 이름"
                value={newRestName}
                onChange={(e) => setNewRestName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#3182f6] text-sm"
              />
              <input
                type="text"
                placeholder="주소 (선택)"
                value={newRestAddr}
                onChange={(e) => setNewRestAddr(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#3182f6] text-sm"
              />
              <button
                type="button"
                onClick={handleCreateRestaurant}
                className="px-4 py-2 rounded-lg text-white text-sm"
                style={{ backgroundColor: '#3182f6' }}
              >
                식당 등록
              </button>
            </div>
          ) : (
            <select
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#3182f6] text-sm"
            >
              <option value="">식당을 선택하세요</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}{r.address ? ` - ${r.address}` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">총 금액</label>
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

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
          style={{ backgroundColor: '#3182f6' }}
        >
          {loading ? '저장 중...' : '회식 기록 저장'}
        </button>
      </form>
    </div>
  );
}

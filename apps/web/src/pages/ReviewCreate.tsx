import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dinnerApi, reviewApi } from '../lib/api';
import type { DinnerRecord } from '@hoesikplate/shared';
import { DEFAULT_TAGS } from '@hoesikplate/shared';

export default function ReviewCreate() {
  const { teamId, dinnerId } = useParams<{ teamId: string; dinnerId: string }>();
  const navigate = useNavigate();
  const [dinner, setDinner] = useState<DinnerRecord | null>(null);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dinnerId) return;
    dinnerApi.getById(dinnerId).then((res) => setDinner(res.data.data)).catch(() => {});
  }, [dinnerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !dinnerId || !dinner || rating === 0) {
      setError('별점을 선택해주세요.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await reviewApi.create({
        content: content || undefined,
        rating,
        dinnerRecordId: dinnerId,
        restaurantId: dinner.restaurantId,
        teamId,
      });
      navigate(`/teams/${teamId}/dinners/${dinnerId}`);
    } catch {
      setError('리뷰 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-2">리뷰 작성</h2>
      {dinner?.restaurant && (
        <p className="text-gray-500 text-sm mb-6">{dinner.restaurant.name} · {dinner.date}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 별점 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">별점</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="text-3xl transition-colors"
                style={{ color: n <= rating ? '#facc15' : '#d1d5db' }}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">후기 (선택)</label>
          <textarea
            placeholder="음식 맛, 분위기, 서비스 등 자유롭게 작성해주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#3182f6] text-sm resize-none"
          />
        </div>

        {/* 태그 (참고용) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">태그 (참고)</label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_TAGS.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
          style={{ backgroundColor: '#3182f6' }}
        >
          {loading ? '저장 중...' : '리뷰 저장'}
        </button>
      </form>
    </div>
  );
}

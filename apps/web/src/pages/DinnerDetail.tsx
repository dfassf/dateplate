import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dinnerApi, reviewApi } from '../lib/api';
import type { DinnerRecord, Review } from '@hoesikplate/shared';

export default function DinnerDetail() {
  const { teamId, dinnerId } = useParams<{ teamId: string; dinnerId: string }>();
  const [dinner, setDinner] = useState<DinnerRecord | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dinnerId || !teamId) return;
    const load = async () => {
      try {
        const [dinnerRes, reviewRes] = await Promise.all([
          dinnerApi.getById(dinnerId),
          reviewApi.getByTeam(teamId),
        ]);
        setDinner(dinnerRes.data.data);
        const filtered = reviewRes.data.data.filter((r) => r.dinnerRecordId === dinnerId);
        setReviews(filtered);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dinnerId, teamId]);

  if (loading) return <p className="text-gray-400">로딩 중...</p>;
  if (!dinner) return <p className="text-red-500">회식 기록을 찾을 수 없습니다.</p>;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{dinner.restaurant?.name ?? '식당'}</h2>
        <Link
          to={`/teams/${teamId}/dinners/${dinnerId}/review`}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold"
          style={{ backgroundColor: '#3182f6' }}
        >
          리뷰 쓰기
        </Link>
      </div>

      <div className="bg-white rounded-xl border p-5 mb-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">날짜</span>
          <span>{dinner.date}</span>
        </div>
        {dinner.headcount && (
          <div className="flex justify-between">
            <span className="text-gray-500">인원</span>
            <span>{dinner.headcount}명</span>
          </div>
        )}
        {dinner.totalAmount && (
          <div className="flex justify-between">
            <span className="text-gray-500">총 금액</span>
            <span>{dinner.totalAmount.toLocaleString()}원</span>
          </div>
        )}
        {dinner.headcount && dinner.totalAmount && (
          <div className="flex justify-between font-semibold">
            <span className="text-gray-500">인당</span>
            <span>{Math.round(dinner.totalAmount / dinner.headcount).toLocaleString()}원</span>
          </div>
        )}
        {dinner.memo && (
          <div className="flex justify-between">
            <span className="text-gray-500">메모</span>
            <span>{dinner.memo}</span>
          </div>
        )}
      </div>

      {/* 리뷰 목록 */}
      <h3 className="font-semibold text-gray-700 mb-3">리뷰</h3>
      {reviews.length === 0 ? (
        <p className="text-gray-400 text-sm">아직 리뷰가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                <span className="text-sm text-gray-400">{r.rating}점</span>
              </div>
              {r.content && <p className="text-sm text-gray-700">{r.content}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

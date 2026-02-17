import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { DinnerRecord } from '@hoesikplate/shared';
import { dinnerApi, reviewApi } from '../lib/api';
import { StarRatingDisplay } from '../components/StarRating';
import { getErrorMessage } from '../lib/error';
import { useAuthStore } from '../stores/authStore';

export default function DinnerDetail() {
  const { teamId, dinnerId } = useParams<{ teamId: string; dinnerId: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const [dinner, setDinner] = useState<DinnerRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!dinnerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    dinnerApi
      .getById(dinnerId)
      .then((data) => {
        setDinner(data);
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, '회식 기록을 불러오지 못했습니다.'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dinnerId]);

  const reviews = useMemo(() => dinner?.reviews || [], [dinner?.reviews]);
  const canDeleteDinner = Boolean(currentUser && dinner?.createdBy === currentUser.id);
  const hasMyReview = Boolean(currentUser && reviews.some((review) => review.authorId === currentUser.id));

  const handleDeleteDinner = async () => {
    if (!dinnerId || !teamId) {
      return;
    }

    if (!window.confirm('회식 기록을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await dinnerApi.delete(dinnerId);
      navigate(`/teams/${teamId}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, '삭제에 실패했습니다.'));
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('리뷰를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await reviewApi.delete(reviewId);
      setDinner((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          reviews: (prev.reviews || []).filter((review) => review.id !== reviewId),
        };
      });
      setNotice('리뷰가 삭제되었습니다.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, '삭제에 실패했습니다.'));
    }
  };

  if (loading) {
    return <p className="text-gray-400">로딩 중...</p>;
  }

  if (!dinner) {
    return <p className="text-red-500">{error || '회식 기록을 찾을 수 없습니다.'}</p>;
  }

  return (
    <div className="max-w-lg mx-auto">
      {(error || notice) && (
        <p className={`mb-3 text-sm ${error ? 'text-red-500' : 'text-blue-600'}`}>
          {error || notice}
        </p>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{dinner.restaurant?.name ?? '식당'}</h2>

        <div className="flex gap-2">
          {!hasMyReview && (
            <Link
              to={`/teams/${teamId}/dinners/${dinnerId}/review`}
              className="px-4 py-2 rounded-xl text-white text-sm font-semibold"
              style={{ backgroundColor: '#3182f6' }}
            >
              리뷰 쓰기
            </Link>
          )}

          {canDeleteDinner && (
            <button
              onClick={() => {
                void handleDeleteDinner();
              }}
              className="px-4 py-2 rounded-xl text-white text-sm font-semibold bg-red-500 hover:bg-red-600"
            >
              삭제
            </button>
          )}
        </div>
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

      <h3 className="font-semibold text-gray-700 mb-3">리뷰</h3>
      {reviews.length === 0 ? (
        <p className="text-gray-400 text-sm">아직 리뷰가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => {
            const canDeleteReview = currentUser && review.authorId === currentUser.id;
            return (
              <div key={review.id} className="bg-white rounded-xl border p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <StarRatingDisplay rating={review.rating} />
                  </div>

                  {canDeleteReview && (
                    <div className="flex gap-2">
                      <Link
                        to={`/teams/${teamId}/reviews/${review.id}/edit`}
                        className="text-sm hover:text-blue-700"
                        style={{ color: '#3182f6' }}
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => {
                          void handleDeleteReview(review.id);
                        }}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>

                {review.content && <p className="text-sm text-gray-700">{review.content}</p>}

                {review.tags && review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {review.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

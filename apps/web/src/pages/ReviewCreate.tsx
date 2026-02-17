import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { DinnerRecord } from '@hoesikplate/shared';
import { dinnerApi, reviewApi } from '../lib/api';
import { getErrorMessage } from '../lib/error';
import { ReviewForm } from '../components/ReviewForm';

export default function ReviewCreate() {
  const { teamId, dinnerId } = useParams<{ teamId: string; dinnerId: string }>();
  const navigate = useNavigate();
  const [dinner, setDinner] = useState<DinnerRecord | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!dinnerId) {
      setPageLoading(false);
      return;
    }

    dinnerApi
      .getById(dinnerId)
      .then((data) => {
        setDinner(data);
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, '회식 정보를 불러오지 못했습니다.'));
      })
      .finally(() => {
        setPageLoading(false);
      });
  }, [dinnerId]);

  if (pageLoading) {
    return <p className="text-gray-400">로딩 중...</p>;
  }

  if (!dinner) {
    return <p className="text-red-500">{error || '회식 정보를 찾을 수 없습니다.'}</p>;
  }

  return (
    <ReviewForm
      title="리뷰 작성"
      subtitle={dinner.restaurant ? `${dinner.restaurant.name} · ${dinner.date}` : undefined}
      error={error}
      loading={loading}
      submitLabel="리뷰 저장"
      submittingLabel="저장 중..."
      onSubmit={async ({ rating, content, selectedTags, visibility }) => {
        if (!teamId || !dinnerId) {
          setError('잘못된 접근입니다.');
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
            tagNames: selectedTags.length > 0 ? selectedTags : undefined,
            visibility,
          });
          navigate(`/teams/${teamId}/dinners/${dinnerId}`);
        } catch (err: unknown) {
          setError(getErrorMessage(err, '리뷰 작성에 실패했습니다.'));
        } finally {
          setLoading(false);
        }
      }}
    />
  );
}

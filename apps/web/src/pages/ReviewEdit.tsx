import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Review } from '@hoesikplate/shared';
import { reviewApi } from '../lib/api';
import { getErrorMessage } from '../lib/error';
import { ReviewForm, type ReviewFormValues } from '../components/ReviewForm';

export default function ReviewEdit() {
  const { teamId, reviewId } = useParams<{ teamId: string; reviewId: string }>();
  const navigate = useNavigate();
  const [review, setReview] = useState<Review | null>(null);
  const [initialValues, setInitialValues] = useState<ReviewFormValues>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!reviewId) {
      setPageLoading(false);
      return;
    }

    reviewApi
      .getById(reviewId)
      .then((data) => {
        setReview(data);
        setInitialValues({
          rating: data.rating,
          content: data.content || '',
          selectedTags: data.tags?.map((tag) => tag.name) || [],
          visibility: data.visibility || 'PRIVATE',
        });
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, '리뷰를 찾을 수 없습니다.'));
      })
      .finally(() => {
        setPageLoading(false);
      });
  }, [reviewId]);

  if (pageLoading) {
    return <p className="text-gray-400">로딩 중...</p>;
  }

  if (!review || !initialValues) {
    return <p className="text-red-500">{error || '리뷰를 찾을 수 없습니다.'}</p>;
  }

  return (
    <ReviewForm
      title="리뷰 수정"
      loading={loading}
      error={error}
      submitLabel="리뷰 수정"
      submittingLabel="저장 중..."
      initialValues={initialValues}
      onSubmit={async ({ rating, content, selectedTags, visibility }) => {
        if (!reviewId) {
          setError('리뷰 ID가 올바르지 않습니다.');
          return;
        }

        setError('');
        setLoading(true);

        try {
          await reviewApi.update(reviewId, {
            rating,
            content: content || undefined,
            tagNames: selectedTags.length > 0 ? selectedTags : undefined,
            visibility,
          });
          navigate(`/teams/${teamId}/dinners/${review.dinnerRecordId}`);
        } catch (err: unknown) {
          setError(getErrorMessage(err, '리뷰 수정에 실패했습니다.'));
        } finally {
          setLoading(false);
        }
      }}
    />
  );
}

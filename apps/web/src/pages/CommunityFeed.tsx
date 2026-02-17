import { useEffect, useState } from 'react';
import type { Review } from '@hoesikplate/shared';
import { StarRatingDisplay } from '../components/StarRating';
import { reviewApi } from '../lib/api';
import { getErrorMessage } from '../lib/error';

const POPULAR_TAGS = ['맛있어요', '가성비', '분위기좋아요', '서비스좋아요', '청결해요', '재방문의사'];

export default function CommunityFeed() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    reviewApi
      .getCommunity(selectedTag || undefined, page, 10)
      .then((result) => {
        setReviews(result.data);
        setTotal(result.total);
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, '커뮤니티 리뷰를 불러오지 못했습니다.'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, selectedTag]);

  const totalPages = Math.ceil(total / 10);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">커뮤니티 리뷰</h2>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => {
            setSelectedTag('');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !selectedTag ? 'text-white' : 'bg-gray-100 text-gray-600'
          }`}
          style={!selectedTag ? { backgroundColor: '#3182f6' } : undefined}
        >
          전체
        </button>
        {POPULAR_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setSelectedTag(tag);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedTag === tag ? 'text-white' : 'bg-gray-100 text-gray-600'
            }`}
            style={selectedTag === tag ? { backgroundColor: '#3182f6' } : undefined}
          >
            #{tag}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400">로딩 중...</p>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">공개된 리뷰가 없습니다.</p>
          <p className="text-xs text-gray-400 mt-1">리뷰 작성 시 공개 범위를 '커뮤니티' 또는 '전체 공개'로 설정해보세요.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-sm">{review.restaurant?.name}</span>
                  <span className="text-gray-400 text-xs ml-2">{review.author?.name}</span>
                </div>
                <StarRatingDisplay rating={review.rating} />
              </div>
              {review.content && <p className="text-sm text-gray-700 mb-2">{review.content}</p>}
              {review.tags && review.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {review.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500 cursor-pointer hover:bg-gray-200"
                      onClick={() => {
                        setSelectedTag(tag.name);
                        setPage(1);
                      }}
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {new Date(review.createdAt).toLocaleDateString('ko-KR')}
              </p>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => setPage(pageNumber)}
              className={`w-8 h-8 rounded-lg text-sm font-medium ${
                pageNumber === page ? 'text-white' : 'bg-gray-100 text-gray-600'
              }`}
              style={pageNumber === page ? { backgroundColor: '#3182f6' } : undefined}
            >
              {pageNumber}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

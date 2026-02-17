import { useEffect, useState } from 'react';
import type { Restaurant } from '@hoesikplate/shared';
import { restaurantApi } from '../lib/api';
import { getErrorMessage } from '../lib/error';

type RankedRestaurant = Restaurant & { visitCount: number; reviewCount: number; avgRating: number };

export default function Rankings() {
  const [restaurants, setRestaurants] = useState<RankedRestaurant[]>([]);
  const [sortBy, setSortBy] = useState('rating');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    restaurantApi
      .getRankings(sortBy)
      .then((data) => {
        setRestaurants(data);
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, '랭킹을 불러오지 못했습니다.'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sortBy]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">맛집 랭킹</h2>
        <div className="flex gap-2">
          {[
            { value: 'rating', label: '평점순' },
            { value: 'visits', label: '방문순' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sortBy === option.value ? 'text-white' : 'bg-gray-100 text-gray-600'
              }`}
              style={sortBy === option.value ? { backgroundColor: '#3182f6' } : undefined}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-400">로딩 중...</p>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">아직 공개된 리뷰가 있는 식당이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {restaurants.map((restaurant, index) => (
            <div key={restaurant.id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{
                  backgroundColor: index < 3 ? '#3182f6' : '#e5e7eb',
                  color: index < 3 ? '#fff' : '#6b7280',
                }}
              >
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{restaurant.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {restaurant.category && <span className="text-xs text-gray-400">{restaurant.category}</span>}
                  {restaurant.address && <span className="text-xs text-gray-400 truncate">{restaurant.address}</span>}
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                {restaurant.avgRating > 0 && <p className="text-yellow-500 font-medium text-sm">★ {restaurant.avgRating}</p>}
                <p className="text-xs text-gray-400">
                  리뷰 {restaurant.reviewCount}개 · {restaurant.visitCount}회 방문
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

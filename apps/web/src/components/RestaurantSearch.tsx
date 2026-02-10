import { useState } from 'react';
import { restaurantApi } from '../lib/api';
import type { Restaurant } from '@hoesikplate/shared';

interface RestaurantSearchProps {
  onSelect?: (restaurant: Restaurant) => void;
  showCreateButton?: boolean;
}

export default function RestaurantSearch({ onSelect, showCreateButton = false }: RestaurantSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({ name: '', address: '', category: '' });

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await restaurantApi.search(query);
      setResults(res.data.data);
    } catch (err) {
      console.error('검색 실패:', err);
      alert('검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoMapOpen = (name: string, address?: string) => {
    const searchQuery = address ? `${name} ${address}` : name;
    const encodedQuery = encodeURIComponent(searchQuery);
    window.open(`https://map.kakao.com/?q=${encodedQuery}`, '_blank');
  };

  const handleCreateRestaurant = async () => {
    if (!newRestaurant.name.trim()) {
      alert('식당 이름을 입력해주세요.');
      return;
    }

    try {
      const res = await restaurantApi.create({
        name: newRestaurant.name,
        address: newRestaurant.address || undefined,
        category: newRestaurant.category || undefined,
      });
      const created = res.data.data;

      // 생성된 식당을 결과에 추가
      setResults([created, ...results]);

      // 폼 초기화
      setNewRestaurant({ name: '', address: '', category: '' });
      setShowCreateForm(false);

      // 선택 콜백 호출
      if (onSelect) {
        onSelect(created);
      }

      alert('식당이 등록되었습니다!');
    } catch (err) {
      console.error('등록 실패:', err);
      alert('식당 등록에 실패했습니다.');
    }
  };

  const handleSelect = (restaurant: Restaurant) => {
    if (onSelect) {
      onSelect(restaurant);
    }
  };

  return (
    <div className="space-y-4">
      {/* 검색 바 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="식당 이름을 검색하세요"
          className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 rounded-xl text-white font-semibold disabled:opacity-50"
          style={{ backgroundColor: '#3182f6' }}
        >
          {loading ? '검색 중...' : '🔍 검색'}
        </button>
      </div>

      {/* 식당 추가 버튼 */}
      {showCreateButton && !showCreateForm && (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          + 검색 결과에 없나요? 직접 등록하기
        </button>
      )}

      {/* 식당 등록 폼 */}
      {showCreateForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">새 식당 등록</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <input
            type="text"
            value={newRestaurant.name}
            onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
            placeholder="식당 이름 *"
            className="w-full px-3 py-2 border rounded-lg"
          />

          <input
            type="text"
            value={newRestaurant.address}
            onChange={(e) => setNewRestaurant({ ...newRestaurant, address: e.target.value })}
            placeholder="주소 (선택)"
            className="w-full px-3 py-2 border rounded-lg"
          />

          <input
            type="text"
            value={newRestaurant.category}
            onChange={(e) => setNewRestaurant({ ...newRestaurant, category: e.target.value })}
            placeholder="카테고리 (예: 한식, 중식) (선택)"
            className="w-full px-3 py-2 border rounded-lg"
          />

          <button
            onClick={handleCreateRestaurant}
            className="w-full px-4 py-2 rounded-lg text-white font-semibold"
            style={{ backgroundColor: '#3182f6' }}
          >
            등록하기
          </button>
        </div>
      )}

      {/* 검색 결과 */}
      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">검색 결과 {results.length}개</p>
          {results.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-xl border p-4 hover:border-blue-400 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{restaurant.name}</h3>
                  {restaurant.address && (
                    <p className="text-sm text-gray-500 mt-1">{restaurant.address}</p>
                  )}
                  {restaurant.category && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      {restaurant.category}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleKakaoMapOpen(restaurant.name, restaurant.address || undefined)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                  >
                    🗺️ 카카오맵
                  </button>

                  {onSelect && (
                    <button
                      onClick={() => handleSelect(restaurant)}
                      className="px-3 py-1 text-sm text-white rounded-lg whitespace-nowrap"
                      style={{ backgroundColor: '#3182f6' }}
                    >
                      선택
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 결과 없음 */}
      {!loading && query && results.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>검색 결과가 없습니다.</p>
          {showCreateButton && (
            <p className="text-sm mt-2">위 버튼을 눌러 직접 등록해주세요.</p>
          )}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { restaurantsApi, type Restaurant } from '../lib/api';

export default function Restaurants() {
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // 신규 등록 폼
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError('');
    try {
      const results = await restaurantsApi.search(searchQuery);
      setRestaurants(results);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '검색 실패');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsAdding(true);
    setError('');
    try {
      const newRestaurant = await restaurantsApi.create({
        name: newName,
        address: newAddress || undefined,
        category: newCategory || undefined,
      });
      setRestaurants((prev) => [newRestaurant, ...prev]);
      setNewName('');
      setNewAddress('');
      setNewCategory('');
      setShowAddForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '등록 실패');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">식당</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
        >
          {showAddForm ? '취소' : '+ 새 식당'}
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* 신규 등록 폼 */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">새 식당 등록</h2>
          <form onSubmit={handleAddRestaurant} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                식당 이름 *
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="식당 이름"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                주소
              </label>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="주소 (선택)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카테고리
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">선택 안함</option>
                <option value="한식">한식</option>
                <option value="일식">일식</option>
                <option value="중식">중식</option>
                <option value="양식">양식</option>
                <option value="카페">카페</option>
                <option value="술집">술집</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isAdding || !newName.trim()}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
            >
              {isAdding ? '등록 중...' : '등록하기'}
            </button>
          </form>
        </div>
      )}

      {/* 검색 */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="식당 이름으로 검색"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
          >
            {isSearching ? '...' : '검색'}
          </button>
        </div>
      </form>

      {/* 검색 결과 */}
      {restaurants.length > 0 ? (
        <div className="space-y-3">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                  {restaurant.address && (
                    <p className="text-sm text-gray-500 mt-1">{restaurant.address}</p>
                  )}
                </div>
                {restaurant.category && (
                  <span className="px-2 py-1 text-xs bg-pink-100 text-pink-700 rounded-full">
                    {restaurant.category}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? '검색 결과가 없습니다' : '식당을 검색해보세요'}
        </div>
      )}
    </div>
  );
}

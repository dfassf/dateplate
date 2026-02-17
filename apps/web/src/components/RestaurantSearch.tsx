import { useEffect, useRef, useState } from 'react';
import type { Restaurant } from '@hoesikplate/shared';
import { useKakaoMaps } from '../hooks/useKakaoMaps';
import { restaurantApi } from '../lib/api';
import { getErrorMessage } from '../lib/error';
import { getKakaoMaps } from '../lib/kakao';

interface KakaoPlace {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name?: string;
  x: string;
  y: string;
  category_name?: string;
}

interface RestaurantSearchProps {
  onSelect?: (restaurant: Restaurant) => void;
  companyLatitude?: number | null;
  companyLongitude?: number | null;
}

export default function RestaurantSearch({
  onSelect,
  companyLatitude,
  companyLongitude,
}: RestaurantSearchProps) {
  const { ready, error: sdkError } = useKakaoMaps();
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<KakaoPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const maps = getKakaoMaps();
    if (query.length < 2 || !ready || !maps?.services) {
      setPlaces([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      const placeService = new maps.services.Places();
      const searchOptions: {
        size: number;
        x?: number;
        y?: number;
        sort?: unknown;
      } = { size: 5 };

      if (companyLatitude && companyLongitude) {
        searchOptions.x = companyLongitude;
        searchOptions.y = companyLatitude;
        searchOptions.sort = maps.services.SortBy.DISTANCE;
      }

      placeService.keywordSearch(
        query,
        (data: unknown[], status: string) => {
          setLoading(false);
          if (status === maps.services.Status.OK) {
            setPlaces((data as KakaoPlace[]).slice(0, 5));
          } else {
            setPlaces([]);
          }
          setShowDropdown(true);
        },
        searchOptions,
      );
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [companyLatitude, companyLongitude, query, ready]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = async (place: KakaoPlace) => {
    setShowDropdown(false);
    setQuery(place.place_name);
    setError('');

    try {
      const restaurant = await restaurantApi.create({
        name: place.place_name,
        address: place.road_address_name || place.address_name,
        category: place.category_name?.split('>').pop()?.trim(),
        kakaoPlaceId: place.id,
        latitude: Number.parseFloat(place.y),
        longitude: Number.parseFloat(place.x),
      });
      onSelect?.(restaurant);
    } catch (err: unknown) {
      setError(getErrorMessage(err, '식당 저장에 실패했습니다.'));
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setError('');
        }}
        onFocus={() => places.length > 0 && setShowDropdown(true)}
        placeholder="식당 이름을 검색하세요"
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#3182f6] text-sm"
      />

      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          검색 중...
        </div>
      )}

      {(sdkError || error) && (
        <p className="text-red-500 text-xs mt-1">{sdkError || error}</p>
      )}

      {showDropdown && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto z-50">
          {places.length > 0 ? (
            places.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => handleSelect(place)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-sm text-gray-900">{place.place_name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {place.road_address_name || place.address_name}
                </div>
                {place.category_name && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    {place.category_name.split('>').pop()?.trim()}
                  </div>
                )}
              </button>
            ))
          ) : (
            !loading && (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">
                검색 결과가 없습니다.
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

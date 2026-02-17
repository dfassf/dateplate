import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Restaurant } from '@hoesikplate/shared';
import { useKakaoMaps } from '../hooks/useKakaoMaps';
import { restaurantApi } from '../lib/api';
import { getErrorMessage } from '../lib/error';
import { getKakaoMaps } from '../lib/kakao';

type RestaurantWithStats = Restaurant & { visitCount: number; avgRating: number };

type MapLike = {
  setBounds: (bounds: unknown) => void;
};

type MarkerLike = {
  setMap: (map: unknown | null) => void;
};

type OverlayLike = {
  setMap: (map: unknown | null) => void;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export default function TeamMap() {
  const { teamId } = useParams<{ teamId: string }>();
  const { ready, error: sdkError } = useKakaoMaps();
  const [restaurants, setRestaurants] = useState<RestaurantWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapLike | null>(null);
  const markersRef = useRef<MarkerLike[]>([]);
  const overlaysRef = useRef<OverlayLike[]>([]);

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    restaurantApi
      .getByTeam(teamId, 'visits')
      .then((data) => {
        setRestaurants(data);
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, '식당 목록을 불러오지 못했습니다.'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [teamId]);

  useEffect(() => {
    if (!ready || !mapRef.current || mapInstanceRef.current) {
      return;
    }

    const maps = getKakaoMaps();
    if (!maps) {
      return;
    }

    mapInstanceRef.current = new maps.Map(mapRef.current, {
      center: new maps.LatLng(37.5665, 126.978),
      level: 5,
    }) as MapLike;
  }, [ready]);

  useEffect(() => {
    const maps = getKakaoMaps();
    const map = mapInstanceRef.current;

    if (!maps || !map || restaurants.length === 0) {
      return;
    }

    markersRef.current.forEach((marker) => marker.setMap(null));
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    markersRef.current = [];
    overlaysRef.current = [];

    const bounds = new maps.LatLngBounds();
    let hasValidCoords = false;

    restaurants.forEach((restaurant) => {
      if (!restaurant.latitude || !restaurant.longitude) {
        return;
      }

      hasValidCoords = true;
      const position = new maps.LatLng(restaurant.latitude, restaurant.longitude);
      bounds.extend(position);

      const marker = new maps.Marker({ position, map }) as MarkerLike;
      markersRef.current.push(marker);

      const ratingText = restaurant.avgRating > 0 ? `★ ${restaurant.avgRating}` : '';
      const content = `
        <div style="padding:8px 12px;background:#fff;border-radius:8px;border:1px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,0.1);font-size:13px;min-width:120px;">
          <div style="font-weight:600;margin-bottom:2px;">${escapeHtml(restaurant.name)}</div>
          ${
            restaurant.category
              ? `<div style="color:#9ca3af;font-size:11px;">${escapeHtml(restaurant.category)}</div>`
              : ''
          }
          <div style="margin-top:4px;display:flex;gap:8px;font-size:12px;">
            ${ratingText ? `<span style="color:#eab308;">${ratingText}</span>` : ''}
            <span style="color:#9ca3af;">${restaurant.visitCount}회 방문</span>
          </div>
        </div>
      `;

      const overlay = new maps.CustomOverlay({
        content,
        position,
        yAnchor: 1.5,
        map: null,
      }) as OverlayLike;

      overlaysRef.current.push(overlay);

      maps.event.addListener(marker, 'click', () => {
        overlaysRef.current.forEach((item) => item.setMap(null));
        overlay.setMap(map);
      });
    });

    if (hasValidCoords) {
      map.setBounds(bounds);
    }

    const closeOverlays = () => {
      overlaysRef.current.forEach((item) => item.setMap(null));
    };

    maps.event.addListener(map, 'click', closeOverlays);

    return () => {
      if (maps.event.removeListener) {
        maps.event.removeListener(map, 'click', closeOverlays);
      }
    };
  }, [restaurants]);

  const hasLocationRestaurants = restaurants.some((restaurant) => restaurant.latitude && restaurant.longitude);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">우리 팀 맛집 지도</h2>
        <Link
          to={`/teams/${teamId}`}
          className="text-sm font-medium"
          style={{ color: '#3182f6' }}
        >
          팀으로 돌아가기
        </Link>
      </div>

      {(error || sdkError) && <p className="text-red-500 text-sm mb-3">{error || sdkError}</p>}

      {loading ? (
        <p className="text-gray-400">로딩 중...</p>
      ) : !hasLocationRestaurants ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">위치 정보가 있는 식당이 없습니다.</p>
          <p className="text-xs text-gray-400 mt-1">
            회식을 기록할 때 카카오맵에서 식당을 검색하면 위치가 저장됩니다.
          </p>
        </div>
      ) : null}

      <div
        ref={mapRef}
        className="w-full rounded-xl border border-gray-300"
        style={{ height: 'calc(100vh - 200px)', minHeight: '400px' }}
      />

      {restaurants.length > 0 && (
        <div className="mt-4 space-y-2">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-xl border p-3 flex items-center justify-between text-sm"
            >
              <div>
                <span className="font-medium">{restaurant.name}</span>
                {restaurant.category && (
                  <span className="text-gray-400 ml-2 text-xs">{restaurant.category}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {restaurant.avgRating > 0 && (
                  <span className="text-yellow-500">★ {restaurant.avgRating}</span>
                )}
                <span className="text-gray-400">{restaurant.visitCount}회</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

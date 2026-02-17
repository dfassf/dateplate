import { useEffect, useRef, useState } from 'react';
import { useKakaoMaps } from '../hooks/useKakaoMaps';
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

interface KakaoMapSearchProps {
  onSelectPlace: (place: {
    kakaoPlaceId: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    category?: string;
  }) => void;
  initialValue?: string;
  placeholder?: string;
}

type MapLike = {
  setCenter: (position: unknown) => void;
};

type MarkerLike = {
  setMap: (map: unknown | null) => void;
};

export default function KakaoMapSearch({
  onSelectPlace,
  initialValue,
  placeholder = '식당 이름 또는 주소 검색',
}: KakaoMapSearchProps) {
  const { ready, error: sdkError } = useKakaoMaps();
  const [searchQuery, setSearchQuery] = useState(initialValue || '');
  const [places, setPlaces] = useState<KakaoPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapLike | null>(null);
  const markersRef = useRef<MarkerLike[]>([]);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justSelectedRef = useRef(false);

  useEffect(() => {
    if (!ready || !mapRef.current || mapInstanceRef.current) {
      return;
    }

    const maps = getKakaoMaps();
    if (!maps) {
      return;
    }

    const center = new maps.LatLng(37.5665, 126.978);
    mapInstanceRef.current = new maps.Map(mapRef.current, {
      center,
      level: 5,
    }) as MapLike;
  }, [ready]);

  useEffect(() => {
    const maps = getKakaoMaps();

    if (!searchQuery.trim() || !ready || !maps?.services) {
      setPlaces([]);
      return;
    }

    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      setLoading(true);
      const placesService = new maps.services.Places();
      placesService.keywordSearch(searchQuery, (data: unknown[], status: string) => {
        setLoading(false);
        if (status === maps.services.Status.OK) {
          setPlaces((data as KakaoPlace[]).slice(0, 10));
          return;
        }
        setPlaces([]);
      });
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [ready, searchQuery]);

  const handleSelectPlace = (place: KakaoPlace) => {
    const maps = getKakaoMaps();

    setPlaces([]);
    justSelectedRef.current = true;
    setSearchQuery(place.place_name);

    if (maps && mapInstanceRef.current) {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      const position = new maps.LatLng(Number.parseFloat(place.y), Number.parseFloat(place.x));
      const marker = new maps.Marker({ position }) as MarkerLike;
      marker.setMap(mapInstanceRef.current);
      mapInstanceRef.current.setCenter(position);
      markersRef.current.push(marker);
    }

    onSelectPlace({
      kakaoPlaceId: place.id,
      name: place.place_name,
      address: place.road_address_name || place.address_name,
      latitude: Number.parseFloat(place.y),
      longitude: Number.parseFloat(place.x),
      category: place.category_name?.split('>').pop()?.trim(),
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#3182f6] text-sm"
        />
        {loading && <p className="text-gray-400 text-xs mt-1">검색 중...</p>}
        {sdkError && <p className="text-red-500 text-xs mt-1">{sdkError}</p>}
      </div>

      <div
        ref={mapRef}
        className="w-full h-64 rounded-xl border border-gray-300"
        style={{ minHeight: '256px' }}
      />

      {places.length > 0 && (
        <div className="border border-gray-200 rounded-xl divide-y max-h-64 overflow-y-auto">
          {places.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => handleSelectPlace(place)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-sm">{place.place_name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {place.road_address_name || place.address_name}
              </div>
              {place.category_name && (
                <div className="text-xs text-gray-400 mt-1">{place.category_name.split('>').pop()?.trim()}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

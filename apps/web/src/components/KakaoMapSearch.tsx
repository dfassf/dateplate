import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoPlace {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name?: string;
  x: string; // longitude
  y: string; // latitude
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
}

export default function KakaoMapSearch({ onSelectPlace, initialValue }: KakaoMapSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue || '');
  const [places, setPlaces] = useState<KakaoPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<KakaoPlace | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // 카카오 지도 SDK 로드
  useEffect(() => {
    const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;
    
    if (!apiKey) {
      console.error('카카오 지도 API 키가 설정되지 않았습니다. .env 파일에 VITE_KAKAO_MAP_API_KEY를 설정해주세요.');
      return;
    }

    // 이미 로드된 경우 처리
    if (window.kakao && window.kakao.maps) {
      if (mapRef.current && !mapInstanceRef.current) {
        const container = mapRef.current;
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울시청
          level: 5,
        };
        mapInstanceRef.current = new window.kakao.maps.Map(container, options);
      }
      return;
    }

    // 이미 스크립트가 있는지 확인
    const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
    if (existingScript) {
      // 기존 스크립트의 로드 완료를 기다림
      const checkKakao = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkKakao);
          window.kakao.maps.load(() => {
            if (mapRef.current && !mapInstanceRef.current) {
              const container = mapRef.current;
              const options = {
                center: new window.kakao.maps.LatLng(37.5665, 126.9780),
                level: 5,
              };
              mapInstanceRef.current = new window.kakao.maps.Map(container, options);
            }
          });
        }
      }, 100);
      return () => clearInterval(checkKakao);
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services,clusterer&autoload=false`;
    script.async = true;
    script.onerror = () => {
      console.error('카카오 지도 SDK 로드에 실패했습니다. API 키와 플랫폼 설정을 확인해주세요.');
    };
    script.onload = () => {
      if (!window.kakao) {
        console.error('카카오 지도 SDK가 로드되지 않았습니다.');
        return;
      }
      window.kakao.maps.load(() => {
        if (mapRef.current && !mapInstanceRef.current) {
          const container = mapRef.current;
          const options = {
            center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울시청
            level: 5,
          };
          try {
            mapInstanceRef.current = new window.kakao.maps.Map(container, options);
          } catch (error) {
            console.error('지도 생성 실패:', error);
          }
        }
      });
    };
    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 스크립트는 제거하지 않음 (다른 컴포넌트에서도 사용 가능)
    };
  }, []);

  // 장소 검색
  const searchPlaces = () => {
    if (!searchQuery.trim() || !window.kakao) return;

    setLoading(true);
    const ps = new window.kakao.maps.services.Places();
    const placesSearchCB = (data: KakaoPlace[], status: string) => {
      setLoading(false);
      if (status === window.kakao.maps.services.Status.OK) {
        setPlaces(data.slice(0, 10)); // 최대 10개만 표시
      } else {
        setPlaces([]);
      }
    };

    ps.keywordSearch(searchQuery, placesSearchCB);
  };

  // 장소 선택
  const handleSelectPlace = (place: KakaoPlace) => {
    setSelectedPlace(place);
    setPlaces([]);
    setSearchQuery(place.place_name);

    // 지도에 마커 표시
    if (mapInstanceRef.current) {
      // 기존 마커 제거
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      const position = new window.kakao.maps.LatLng(parseFloat(place.y), parseFloat(place.x));
      const marker = new window.kakao.maps.Marker({ position });
      marker.setMap(mapInstanceRef.current);
      mapInstanceRef.current.setCenter(position);
      markersRef.current.push(marker);
    }

    // 부모 컴포넌트에 선택된 장소 정보 전달
    onSelectPlace({
      kakaoPlaceId: place.id,
      name: place.place_name,
      address: place.road_address_name || place.address_name,
      latitude: parseFloat(place.y),
      longitude: parseFloat(place.x),
      category: place.category_name?.split('>').pop()?.trim(),
    });
  };

  return (
    <div className="space-y-3">
      {/* 검색 입력 */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="식당 이름 또는 주소 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              searchPlaces();
            }
          }}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#3182f6] text-sm"
        />
        <button
          type="button"
          onClick={searchPlaces}
          disabled={loading || !searchQuery.trim()}
          className="px-6 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#3182f6' }}
        >
          {loading ? '검색 중...' : '검색'}
        </button>
      </div>

      {/* 지도 표시 */}
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-xl border border-gray-300"
        style={{ minHeight: '256px' }}
      />

      {/* 검색 결과 목록 */}
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

      {/* 선택된 장소 표시 */}
      {selectedPlace && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm">
          <div className="font-medium text-blue-900">선택된 장소</div>
          <div className="text-blue-700 mt-1">{selectedPlace.place_name}</div>
          <div className="text-blue-600 text-xs mt-1">
            {selectedPlace.road_address_name || selectedPlace.address_name}
          </div>
        </div>
      )}
    </div>
  );
}

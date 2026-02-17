import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KakaoMapSearch from '../components/KakaoMapSearch';
import { userApi } from '../lib/api';
import { getErrorMessage } from '../lib/error';
import { useAuthStore } from '../stores/authStore';

interface SelectedPlace {
  kakaoPlaceId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category?: string;
}

export default function RegisterCompany() {
  const navigate = useNavigate();
  const updateUser = useAuthStore((state) => state.updateUser);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!selectedPlace) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await userApi.updateProfile({
        companyAddress: selectedPlace.address,
        companyLatitude: selectedPlace.latitude,
        companyLongitude: selectedPlace.longitude,
      });
      updateUser(user);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(getErrorMessage(err, '저장에 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-6">
        <h1 className="text-2xl font-bold text-center mb-2" style={{ color: '#3182f6' }}>
          회사 위치 설정
        </h1>
        <p className="text-center text-sm text-gray-500 mb-8">
          회식 장소 검색 시 회사 주변의 장소를 먼저 찾아줘요
        </p>

        <KakaoMapSearch
          onSelectPlace={(place) => {
            setSelectedPlace(place);
          }}
          placeholder="회사 이름 또는 주소 검색"
        />

        {selectedPlace && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm">
            <div className="font-medium text-blue-900">{selectedPlace.name}</div>
            <div className="text-blue-600 text-xs mt-1">{selectedPlace.address}</div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => {
              void handleSave();
            }}
            disabled={loading || !selectedPlace}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#3182f6' }}
          >
            {loading ? '저장 중...' : '저장하고 시작하기'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 rounded-xl text-gray-500 font-medium text-sm hover:bg-gray-100"
          >
            건너뛰기
          </button>
        </div>
      </div>
    </div>
  );
}

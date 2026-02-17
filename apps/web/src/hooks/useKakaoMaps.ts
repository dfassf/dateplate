import { useEffect, useState } from 'react';
import { ensureKakaoMapsLoaded } from '../lib/kakao';

export const useKakaoMaps = () => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;
    if (!apiKey) {
      setError('카카오 지도 API 키가 설정되지 않았습니다.');
      return;
    }

    let cancelled = false;

    ensureKakaoMapsLoaded(apiKey)
      .then(() => {
        if (!cancelled) {
          setReady(true);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '카카오 지도 SDK 로드에 실패했습니다.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ready, error };
};

interface KakaoPlaces {
  keywordSearch: (
    query: string,
    callback: (data: unknown[], status: string) => void,
    options?: Record<string, unknown>,
  ) => void;
}

interface KakaoMapsServices {
  Places: new () => KakaoPlaces;
  Status: {
    OK: string;
  };
  SortBy: {
    DISTANCE: unknown;
  };
}

interface KakaoMapsEvent {
  addListener: (target: unknown, eventName: string, handler: () => void) => void;
  removeListener?: (target: unknown, eventName: string, handler: () => void) => void;
}

export interface KakaoMaps {
  load: (callback: () => void) => void;
  LatLng: new (latitude: number, longitude: number) => unknown;
  LatLngBounds: new () => {
    extend: (position: unknown) => void;
  };
  Map: new (container: HTMLElement, options: { center: unknown; level: number }) => unknown;
  Marker: new (options: { position: unknown; map?: unknown }) => unknown;
  CustomOverlay: new (options: {
    content: string;
    position: unknown;
    yAnchor: number;
    map: unknown | null;
  }) => unknown;
  services: KakaoMapsServices;
  event: KakaoMapsEvent;
}

const KAKAO_SCRIPT_SELECTOR = 'script[src*="dapi.kakao.com/v2/maps/sdk.js"]';

let kakaoSdkPromise: Promise<void> | null = null;

const getWindowMaps = (): KakaoMaps | null => {
  const maps = window.kakao?.maps;
  return maps ? (maps as KakaoMaps) : null;
};

const loadKakaoMaps = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const maps = getWindowMaps();
    if (!maps) {
      reject(new Error('카카오 지도 SDK가 로드되지 않았습니다.'));
      return;
    }

    maps.load(() => {
      resolve();
    });
  });
};

export const ensureKakaoMapsLoaded = async (apiKey: string): Promise<void> => {
  if (!apiKey) {
    throw new Error('카카오 지도 API 키가 설정되지 않았습니다.');
  }

  if (getWindowMaps()?.LatLng) {
    return;
  }

  if (!kakaoSdkPromise) {
    kakaoSdkPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(KAKAO_SCRIPT_SELECTOR);

      const handleError = () => {
        reject(new Error('카카오 지도 SDK 로드에 실패했습니다.'));
      };

      const handleLoad = () => {
        loadKakaoMaps().then(resolve).catch(reject);
      };

      if (existingScript) {
        if (getWindowMaps()) {
          handleLoad();
          return;
        }

        existingScript.addEventListener('load', handleLoad, { once: true });
        existingScript.addEventListener('error', handleError, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services,clusterer&autoload=false`;
      script.async = true;
      script.addEventListener('load', handleLoad, { once: true });
      script.addEventListener('error', handleError, { once: true });
      document.head.appendChild(script);
    });
  }

  try {
    await kakaoSdkPromise;
  } catch (error) {
    kakaoSdkPromise = null;
    throw error;
  }
};

export const getKakaoMaps = () => getWindowMaps();

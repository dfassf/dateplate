import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Restaurant, SessionType } from '@hoesikplate/shared';
import { restaurantApi, sessionApi } from '../lib/api';
import { getErrorMessage } from '../lib/error';

type RestaurantWithStats = Restaurant & { visitCount: number; avgRating: number };

const CONFIG: Record<SessionType, { title: string; buttonText: string; playPath: string }> = {
  TOURNAMENT: { title: '이상형 월드컵', buttonText: '월드컵 시작!', playPath: 'tournament' },
  ROULETTE: { title: '룰렛 돌리기', buttonText: '룰렛 시작!', playPath: 'roulette' },
};

interface SessionCreateProps {
  sessionType: SessionType;
}

export default function SessionCreate({ sessionType }: SessionCreateProps) {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const config = CONFIG[sessionType];

  const [restaurants, setRestaurants] = useState<RestaurantWithStats[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!teamId) {
      return;
    }

    restaurantApi
      .getByTeam(teamId, 'visits')
      .then((data) => {
        setRestaurants(data);
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, '식당 목록을 불러오지 못했습니다.'));
      });
  }, [teamId]);

  const totalCount = useMemo(
    () => selectedIds.size + customOptions.length,
    [customOptions.length, selectedIds.size],
  );

  const toggleRestaurant = (id: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addCustomOption = () => {
    const trimmed = customInput.trim();
    if (!trimmed || customOptions.includes(trimmed)) {
      return;
    }

    setCustomOptions((previous) => [...previous, trimmed]);
    setCustomInput('');
  };

  const handleStart = async () => {
    if (!teamId || totalCount < 2) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const options = [
        ...restaurants
          .filter((restaurant) => selectedIds.has(restaurant.id))
          .map((restaurant) => ({ name: restaurant.name, restaurantId: restaurant.id })),
        ...customOptions.map((name) => ({ name })),
      ];

      const session = await sessionApi.create({
        type: sessionType,
        teamId,
        title: title || undefined,
        options,
      });

      navigate(`/teams/${teamId}/${config.playPath}/${session.id}/play`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, '세션 생성에 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-6">{config.title}</h2>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">제목 (선택)</label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="오늘 뭐 먹지?"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#3182f6] text-sm"
        />
      </div>

      {restaurants.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">팀 식당에서 선택</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {restaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                type="button"
                onClick={() => toggleRestaurant(restaurant.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                  selectedIds.has(restaurant.id)
                    ? 'border-[#3182f6] bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{restaurant.name}</span>
                    {restaurant.category && (
                      <span className="text-gray-400 ml-2 text-xs">{restaurant.category}</span>
                    )}
                  </div>
                  {selectedIds.has(restaurant.id) && <span style={{ color: '#3182f6' }}>✓</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">직접 추가</h3>
        <div className="flex gap-2">
          <input
            value={customInput}
            onChange={(event) => setCustomInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) {
                return;
              }
              if (event.key === 'Enter') {
                event.preventDefault();
                addCustomOption();
              }
            }}
            placeholder="메뉴 또는 식당 이름"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#3182f6] text-sm"
          />
          <button
            type="button"
            onClick={addCustomOption}
            className="px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ backgroundColor: '#3182f6' }}
          >
            추가
          </button>
        </div>

        {customOptions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {customOptions.map((option) => (
              <span
                key={option}
                className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 flex items-center gap-1"
              >
                {option}
                <button
                  onClick={() => {
                    setCustomOptions((previous) => previous.filter((value) => value !== option));
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500 mb-4">
        선택된 항목: {totalCount}개 {totalCount < 2 && '(최소 2개 필요)'}
      </div>

      <button
        onClick={() => {
          void handleStart();
        }}
        disabled={totalCount < 2 || loading}
        className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50"
        style={{ backgroundColor: '#3182f6' }}
      >
        {loading ? '생성 중...' : config.buttonText}
      </button>
    </div>
  );
}

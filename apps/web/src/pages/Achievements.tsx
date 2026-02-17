import { useEffect, useState } from 'react';
import type { Achievement } from '@hoesikplate/shared';
import { gamificationApi } from '../lib/api';
import { getErrorMessage } from '../lib/error';

const BADGE_ICONS: Record<string, string> = {
  FIRST_REVIEW: '✍️',
  REVIEW_5: '📝',
  REVIEW_10: '🏅',
  DINNER_5: '🍽️',
  DINNER_10: '🎖️',
  RESTAURANT_5: '🗺️',
  GOLDEN_TICKET: '🎫',
};

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    gamificationApi
      .checkAchievements()
      .then((data) => {
        setAchievements(data);
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, '업적 정보를 불러오지 못했습니다.'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-gray-400">로딩 중...</p>;
  }

  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;

  return (
    <div>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="mb-6">
        <h2 className="text-xl font-bold">업적</h2>
        <p className="text-sm text-gray-500 mt-1">
          {unlockedCount} / {achievements.length} 달성
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.code}
            className={`rounded-xl border p-4 text-center transition-all ${
              achievement.unlocked ? 'bg-white border-[#3182f6]' : 'bg-gray-50 border-gray-200 opacity-50'
            }`}
          >
            <p className="text-3xl mb-2">{BADGE_ICONS[achievement.code] || '🏆'}</p>
            <p className="font-semibold text-sm">{achievement.title}</p>
            <p className="text-xs text-gray-400 mt-1">{achievement.description}</p>
            {achievement.unlockedAt && (
              <p className="text-xs mt-2" style={{ color: '#3182f6' }}>
                {new Date(achievement.unlockedAt).toLocaleDateString('ko-KR')} 달성
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

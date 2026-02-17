import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { DinnerRecord, Team } from '@hoesikplate/shared';
import { dinnerApi, teamApi } from '../lib/api';
import { getErrorMessage } from '../lib/error';

export default function Dashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [recentDinners, setRecentDinners] = useState<(DinnerRecord & { team?: Team })[]>([]);
  const [thisMonthCount, setThisMonthCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([teamApi.getMyTeams(), dinnerApi.getRecent()])
      .then(([teamList, recent]) => {
        setTeams(teamList);
        setRecentDinners(recent.recent);
        setThisMonthCount(recent.thisMonthCount);
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, '대시보드를 불러오지 못했습니다.'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-gray-400">로딩 중...</p>;
  }

  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="space-y-8">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: '#3182f6' }}>
        <p className="text-sm opacity-80">{currentMonth}월 회식 현황</p>
        <p className="text-3xl font-bold mt-1">{thisMonthCount}회</p>
        <p className="text-sm mt-2 opacity-80">
          {thisMonthCount === 0
            ? '아직 이번 달 회식이 없어요!'
            : `이번 달 ${thisMonthCount}회 회식을 했어요!`}
        </p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">내 팀</h2>
          <div className="flex gap-2">
            <Link
              to="/teams/join"
              className="px-3 py-1.5 rounded-lg border text-xs font-semibold"
              style={{ borderColor: '#3182f6', color: '#3182f6' }}
            >
              팀 합류
            </Link>
            <Link
              to="/teams/create"
              className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold"
              style={{ backgroundColor: '#3182f6' }}
            >
              팀 만들기
            </Link>
          </div>
        </div>

        {teams.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm">아직 소속된 팀이 없습니다.</p>
            <p className="text-xs text-gray-400 mt-1">팀을 만들거나 초대 코드로 합류해보세요!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {teams.map((team) => (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="block bg-white rounded-xl border p-4 hover:border-[#3182f6] transition-colors"
              >
                <h3 className="font-semibold">{team.name}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(team.createdAt).toLocaleDateString('ko-KR')} 생성
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">최근 회식</h2>
        {recentDinners.length === 0 ? (
          <p className="text-gray-400 text-sm">아직 회식 기록이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {recentDinners.map((dinner) => (
              <Link
                key={dinner.id}
                to={`/teams/${dinner.teamId}/dinners/${dinner.id}`}
                className="block bg-white rounded-xl border p-4 hover:border-[#3182f6] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{dinner.restaurant?.name ?? '식당 정보 없음'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {dinner.team?.name} · {new Date(dinner.date).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {dinner.headcount && <span>{dinner.headcount}명</span>}
                    {dinner.totalAmount && (
                      <span className="ml-2">{dinner.totalAmount.toLocaleString()}원</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

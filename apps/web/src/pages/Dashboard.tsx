import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teamApi } from '../lib/api';
import type { Team } from '@hoesikplate/shared';

export default function Dashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teamApi
      .getMyTeams()
      .then((res) => setTeams(res.data.data))
      .catch((err) => {
        console.error('팀 목록 조회 실패:', err);
        setTeams([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">내 팀</h2>
        <div className="flex gap-2">
          <Link
            to="/teams/join"
            className="px-4 py-2 rounded-xl border text-sm font-semibold"
            style={{ borderColor: '#3182f6', color: '#3182f6' }}
          >
            팀 합류
          </Link>
          <Link
            to="/teams/create"
            className="px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ backgroundColor: '#3182f6' }}
          >
            팀 만들기
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">로딩 중...</p>
      ) : teams.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-2">아직 소속된 팀이 없습니다.</p>
          <p className="text-sm text-gray-400">팀을 만들거나 초대 코드로 합류해보세요!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {teams.map((t) => (
            <Link
              key={t.id}
              to={`/teams/${t.id}`}
              className="block bg-white rounded-xl border p-5 hover:border-[#3182f6] transition-colors"
            >
              <h3 className="font-semibold text-lg">{t.name}</h3>
              <p className="text-sm text-gray-400 mt-1">
                {new Date(t.createdAt).toLocaleDateString('ko-KR')} 생성
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

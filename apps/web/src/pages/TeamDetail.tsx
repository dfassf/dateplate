import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teamApi, dinnerApi } from '../lib/api';
import type { Team, TeamMember, DinnerRecord } from '@hoesikplate/shared';

export default function TeamDetail() {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<(Team & { members: TeamMember[] }) | null>(null);
  const [dinners, setDinners] = useState<DinnerRecord[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;
    const load = async () => {
      try {
        const [teamRes, dinnerRes] = await Promise.all([
          teamApi.getById(teamId),
          dinnerApi.getByTeam(teamId),
        ]);
        setTeam(teamRes.data.data);
        // PaginatedResponse의 경우 { data: { data: [], total, page, limit } } 형식
        const paginatedData = dinnerRes.data.data as any;
        setDinners(Array.isArray(paginatedData) ? paginatedData : (paginatedData?.data || []));
      } catch (err) {
        console.error('팀 정보 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teamId]);

  const handleCreateInvite = async () => {
    if (!teamId) return;
    try {
      const res = await teamApi.createInvite(teamId);
      setInviteCode(res.data.data.inviteCode);
    } catch {
      alert('초대 코드 생성에 실패했습니다.');
    }
  };

  if (loading) return <p className="text-gray-400">로딩 중...</p>;
  if (!team) return <p className="text-red-500">팀을 찾을 수 없습니다.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{team.name}</h2>
          <p className="text-sm text-gray-500">멤버 {team.members.length}명</p>
        </div>
        <Link
          to={`/teams/${teamId}/dinners/create`}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold"
          style={{ backgroundColor: '#3182f6' }}
        >
          회식 기록하기
        </Link>
      </div>

      {/* 멤버 목록 */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">멤버</h3>
          <button
            onClick={handleCreateInvite}
            className="text-sm font-medium"
            style={{ color: '#3182f6' }}
          >
            초대 코드 생성
          </button>
        </div>
        {inviteCode && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 text-sm">
            초대 코드: <span className="font-mono font-bold">{inviteCode}</span>
          </div>
        )}
        <div className="bg-white rounded-xl border divide-y">
          {team.members.map((m) => (
            <div key={m.id} className="px-4 py-3 flex items-center justify-between text-sm">
              <span>{m.user.name}</span>
              <span className="text-gray-400">{m.role === 'LEADER' ? '팀장' : '멤버'}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 회식 히스토리 */}
      <section>
        <h3 className="font-semibold text-gray-700 mb-3">회식 히스토리</h3>
        {dinners.length === 0 ? (
          <p className="text-gray-400 text-sm">아직 회식 기록이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {dinners.map((d) => (
              <Link
                key={d.id}
                to={`/teams/${teamId}/dinners/${d.id}`}
                className="block bg-white rounded-xl border p-4 hover:border-[#3182f6] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{d.restaurant?.name ?? '식당 정보 없음'}</p>
                    <p className="text-sm text-gray-500">{d.date}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {d.headcount && <span>{d.headcount}명</span>}
                    {d.totalAmount && (
                      <span className="ml-2">{d.totalAmount.toLocaleString()}원</span>
                    )}
                  </div>
                </div>
                {d.memo && <p className="text-sm text-gray-400 mt-1">{d.memo}</p>}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

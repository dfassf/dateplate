import { useEffect, useMemo, useState } from 'react';
import type { Team, TeamMember } from '@hoesikplate/shared';
import { useParams } from 'react-router-dom';
import { gamificationApi, teamApi } from '../lib/api';
import { getErrorMessage } from '../lib/error';
import { useAuthStore } from '../stores/authStore';

export default function TicketGiving() {
  const { teamId } = useParams<{ teamId: string }>();
  const currentUser = useAuthStore((state) => state.user);

  const [team, setTeam] = useState<(Team & { members: TeamMember[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [givenTickets, setGivenTickets] = useState<Record<string, 'GOLDEN' | 'BLACK'>>({});

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    teamApi
      .getById(teamId)
      .then((teamData) => {
        setTeam(teamData);
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, '팀을 불러오지 못했습니다.'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [teamId]);

  const otherMembers = useMemo(
    () => team?.members.filter((member) => member.userId !== currentUser?.id) || [],
    [currentUser?.id, team?.members],
  );

  const handleGiveTicket = async (toUserId: string, type: 'GOLDEN' | 'BLACK') => {
    if (!teamId) {
      return;
    }

    setError('');
    setNotice('');

    try {
      await gamificationApi.giveTicket({ toUserId, teamId, type });
      setGivenTickets((previous) => ({ ...previous, [toUserId]: type }));
      setNotice('티켓을 전달했습니다.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, '티켓 부여에 실패했습니다.'));
    }
  };

  if (loading) {
    return <p className="text-gray-400">로딩 중...</p>;
  }

  if (!team) {
    return <p className="text-red-500">{error || '팀을 찾을 수 없습니다.'}</p>;
  }

  return (
    <div className="max-w-lg mx-auto">
      {(error || notice) && (
        <p className={`mb-3 text-sm ${error ? 'text-red-500' : 'text-blue-600'}`}>
          {error || notice}
        </p>
      )}

      <h2 className="text-xl font-bold mb-2">팀원 평가</h2>
      <p className="text-sm text-gray-500 mb-6">이번 달 함께한 팀원에게 티켓을 보내세요!</p>

      <div className="space-y-3">
        {otherMembers.map((member) => {
          const given = givenTickets[member.userId];
          return (
            <div
              key={member.id}
              className="bg-white rounded-xl border p-4 flex items-center justify-between"
            >
              <span className="font-medium text-sm">{member.user.name}</span>
              {given ? (
                <span className="text-sm">
                  {given === 'GOLDEN' ? '🎫 황금 티켓 전달됨' : '🖤 블랙 티켓 전달됨'}
                </span>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      void handleGiveTicket(member.userId, 'GOLDEN');
                    }}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-yellow-50 text-yellow-600 border border-yellow-200 hover:bg-yellow-100"
                  >
                    🎫 황금
                  </button>
                  <button
                    onClick={() => {
                      void handleGiveTicket(member.userId, 'BLACK');
                    }}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                  >
                    🖤 블랙
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

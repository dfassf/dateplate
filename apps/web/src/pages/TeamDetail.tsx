import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type {
  DinnerRecord,
  Restaurant,
  Session,
  Team,
  TeamMember,
} from '@hoesikplate/shared';
import { dinnerApi, restaurantApi, sessionApi, teamApi } from '../lib/api';
import { getErrorMessage } from '../lib/error';
import { useAuthStore } from '../stores/authStore';

type RestaurantWithStats = Restaurant & { visitCount: number; avgRating: number };
type CompletedSession = Session & { creator?: { id: string; name: string } };

interface TeamHeaderProps {
  isLeader: boolean;
  team: Team & { members: TeamMember[] };
  teamId: string;
  editingName: boolean;
  newName: string;
  setNewName: (value: string) => void;
  setEditingName: (value: boolean) => void;
  onSaveName: () => Promise<void>;
  onDeleteTeam: () => Promise<void>;
}

function TeamHeader({
  isLeader,
  team,
  teamId,
  editingName,
  newName,
  setNewName,
  setEditingName,
  onSaveName,
  onDeleteTeam,
}: TeamHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        {editingName ? (
          <div className="flex items-center gap-2">
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              className="text-2xl font-bold border-b-2 border-[#3182f6] outline-none bg-transparent"
              autoFocus
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void onSaveName();
                }
                if (event.key === 'Escape') {
                  setEditingName(false);
                }
              }}
            />
            <button
              onClick={() => {
                void onSaveName();
              }}
              className="text-sm font-medium"
              style={{ color: '#3182f6' }}
            >
              저장
            </button>
            <button
              onClick={() => setEditingName(false)}
              className="text-sm text-gray-400"
            >
              취소
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{team.name}</h2>
            {isLeader && (
              <button
                onClick={() => {
                  setNewName(team.name);
                  setEditingName(true);
                }}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                수정
              </button>
            )}
          </div>
        )}
        <p className="text-sm text-gray-500">멤버 {team.members.length}명</p>
      </div>

      <div className="flex gap-2">
        <Link
          to={`/teams/${teamId}/dinners/create`}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold"
          style={{ backgroundColor: '#3182f6' }}
        >
          회식 기록하기
        </Link>
        {isLeader && (
          <button
            onClick={() => {
              void onDeleteTeam();
            }}
            className="px-4 py-2 rounded-xl text-white text-sm font-semibold bg-red-500 hover:bg-red-600"
          >
            팀 삭제
          </button>
        )}
      </div>
    </div>
  );
}

interface TeamMembersSectionProps {
  members: TeamMember[];
  inviteCode: string;
  onCreateInvite: () => Promise<void>;
}

function TeamMembersSection({ members, inviteCode, onCreateInvite }: TeamMembersSectionProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700">멤버</h3>
        <button
          onClick={() => {
            void onCreateInvite();
          }}
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
        {members.map((member) => (
          <div
            key={member.id}
            className="px-4 py-3 flex items-center justify-between text-sm"
          >
            <span>{member.user.name}</span>
            <span className="text-gray-400">{member.role === 'LEADER' ? '팀장' : '멤버'}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TeamActionsSection({ teamId }: { teamId: string }) {
  return (
    <section className="mb-8">
      <h3 className="font-semibold text-gray-700 mb-3">오늘 뭐 먹지?</h3>
      <div className="grid grid-cols-2 gap-3">
        <Link
          to={`/teams/${teamId}/tournament`}
          className="bg-white rounded-xl border p-4 text-center hover:border-[#3182f6] transition-colors"
        >
          <p className="text-2xl mb-1">🏆</p>
          <p className="font-medium text-sm">이상형 월드컵</p>
          <p className="text-xs text-gray-400 mt-1">토너먼트로 결정</p>
        </Link>
        <Link
          to={`/teams/${teamId}/roulette`}
          className="bg-white rounded-xl border p-4 text-center hover:border-[#3182f6] transition-colors"
        >
          <p className="text-2xl mb-1">🎰</p>
          <p className="font-medium text-sm">룰렛</p>
          <p className="text-xs text-gray-400 mt-1">랜덤으로 결정</p>
        </Link>
        <Link
          to={`/teams/${teamId}/stats`}
          className="bg-white rounded-xl border p-4 text-center hover:border-[#3182f6] transition-colors"
        >
          <p className="text-2xl mb-1">📊</p>
          <p className="font-medium text-sm">통계</p>
          <p className="text-xs text-gray-400 mt-1">팀 회식 분석</p>
        </Link>
        <Link
          to={`/teams/${teamId}/tickets`}
          className="bg-white rounded-xl border p-4 text-center hover:border-[#3182f6] transition-colors"
        >
          <p className="text-2xl mb-1">🎫</p>
          <p className="font-medium text-sm">팀원 평가</p>
          <p className="text-xs text-gray-400 mt-1">티켓 주기</p>
        </Link>
      </div>
    </section>
  );
}

function RecentSessionsSection({ sessions }: { sessions: CompletedSession[] }) {
  if (sessions.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <h3 className="font-semibold text-gray-700 mb-3">최근 결정</h3>
      <div className="space-y-2">
        {sessions.slice(0, 5).map((session) => (
          <div
            key={session.id}
            className="bg-white rounded-xl border p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{session.type === 'TOURNAMENT' ? '🏆' : '🎰'}</span>
              <div>
                <p className="font-medium text-sm">{session.result}</p>
                <p className="text-xs text-gray-400">
                  {session.title || (session.type === 'TOURNAMENT' ? '이상형 월드컵' : '룰렛')}
                  {session.creator && <span> · {session.creator.name}</span>}
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(session.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

interface TeamRestaurantsSectionProps {
  teamId: string;
  restaurants: RestaurantWithStats[];
  restaurantSort: string;
  onChangeSort: (sort: string) => void;
}

function TeamRestaurantsSection({
  teamId,
  restaurants,
  restaurantSort,
  onChangeSort,
}: TeamRestaurantsSectionProps) {
  if (restaurants.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700">우리 팀 맛집</h3>

        <div className="flex items-center gap-3">
          <Link
            to={`/teams/${teamId}/map`}
            className="text-sm font-medium"
            style={{ color: '#3182f6' }}
          >
            지도 보기
          </Link>
          <select
            value={restaurantSort}
            onChange={(event) => onChangeSort(event.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1"
          >
            <option value="visits">방문순</option>
            <option value="rating">평점순</option>
            <option value="name">이름순</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="bg-white rounded-xl border p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-sm">{restaurant.name}</p>
              {restaurant.category && (
                <p className="text-xs text-gray-400">{restaurant.category}</p>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm">
              {restaurant.avgRating > 0 && (
                <span className="text-yellow-500">★ {restaurant.avgRating}</span>
              )}
              <span className="text-gray-400">{restaurant.visitCount}회 방문</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DinnerHistorySection({
  teamId,
  dinners,
}: {
  teamId: string;
  dinners: DinnerRecord[];
}) {
  return (
    <section>
      <h3 className="font-semibold text-gray-700 mb-3">회식 히스토리</h3>
      {dinners.length === 0 ? (
        <p className="text-gray-400 text-sm">아직 회식 기록이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {dinners.map((dinner) => (
            <Link
              key={dinner.id}
              to={`/teams/${teamId}/dinners/${dinner.id}`}
              className="block bg-white rounded-xl border p-4 hover:border-[#3182f6] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{dinner.restaurant?.name ?? '식당 정보 없음'}</p>
                  <p className="text-sm text-gray-500">{dinner.date}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  {dinner.headcount && <span>{dinner.headcount}명</span>}
                  {dinner.totalAmount && (
                    <span className="ml-2">{dinner.totalAmount.toLocaleString()}원</span>
                  )}
                </div>
              </div>
              {dinner.memo && <p className="text-sm text-gray-400 mt-1">{dinner.memo}</p>}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default function TeamDetail() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const [team, setTeam] = useState<(Team & { members: TeamMember[] }) | null>(null);
  const [dinners, setDinners] = useState<DinnerRecord[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantWithStats[]>([]);
  const [completedSessions, setCompletedSessions] = useState<CompletedSession[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [restaurantSort, setRestaurantSort] = useState('visits');
  const [loading, setLoading] = useState(true);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    Promise.all([
      teamApi.getById(teamId),
      dinnerApi.getByTeam(teamId),
      sessionApi.getByTeam(teamId, 'COMPLETED'),
    ])
      .then(([teamData, dinnerPage, sessions]) => {
        setTeam(teamData);
        setDinners(dinnerPage.data);
        setCompletedSessions(sessions);
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, '팀 정보를 불러오지 못했습니다.'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [teamId]);

  useEffect(() => {
    if (!teamId) {
      return;
    }

    setRestaurantsLoading(true);
    restaurantApi
      .getByTeam(teamId, restaurantSort)
      .then((data) => {
        setRestaurants(data);
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, '식당 목록을 불러오지 못했습니다.'));
      })
      .finally(() => {
        setRestaurantsLoading(false);
      });
  }, [restaurantSort, teamId]);

  const isLeader = useMemo(
    () => Boolean(team && currentUser?.id === team.leaderId),
    [currentUser?.id, team],
  );

  const handleUpdateName = async () => {
    if (!teamId || !newName.trim()) {
      return;
    }

    setError('');

    try {
      const updatedTeam = await teamApi.update(teamId, { name: newName.trim() });
      setTeam((prev) => (prev ? { ...prev, name: updatedTeam.name } : prev));
      setEditingName(false);
      setNotice('팀 이름이 수정되었습니다.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, '팀 이름 수정에 실패했습니다.'));
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamId) {
      return;
    }

    if (!window.confirm('팀을 삭제하시겠습니까? 모든 데이터가 삭제됩니다.')) {
      return;
    }

    try {
      await teamApi.delete(teamId);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(getErrorMessage(err, '팀 삭제에 실패했습니다.'));
    }
  };

  const handleCreateInvite = async () => {
    if (!teamId) {
      return;
    }

    setError('');

    try {
      const invite = await teamApi.createInvite(teamId);
      setInviteCode(invite.inviteCode);
      setNotice('초대 코드가 생성되었습니다.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, '초대 코드 생성에 실패했습니다.'));
    }
  };

  if (loading) {
    return <p className="text-gray-400">로딩 중...</p>;
  }

  if (!team) {
    return <p className="text-red-500">{error || '팀을 찾을 수 없습니다.'}</p>;
  }

  return (
    <div>
      {(error || notice) && (
        <p className={`mb-4 text-sm ${error ? 'text-red-500' : 'text-blue-600'}`}>
          {error || notice}
        </p>
      )}

      <TeamHeader
        isLeader={isLeader}
        team={team}
        teamId={teamId || ''}
        editingName={editingName}
        newName={newName}
        setNewName={setNewName}
        setEditingName={setEditingName}
        onSaveName={handleUpdateName}
        onDeleteTeam={handleDeleteTeam}
      />

      <TeamMembersSection
        members={team.members}
        inviteCode={inviteCode}
        onCreateInvite={handleCreateInvite}
      />

      <TeamActionsSection teamId={teamId || ''} />

      <RecentSessionsSection sessions={completedSessions} />

      {restaurantsLoading ? (
        <p className="text-gray-400 text-sm mb-8">식당 목록을 불러오는 중...</p>
      ) : (
        <TeamRestaurantsSection
          teamId={teamId || ''}
          restaurants={restaurants}
          restaurantSort={restaurantSort}
          onChangeSort={setRestaurantSort}
        />
      )}

      <DinnerHistorySection teamId={teamId || ''} dinners={dinners} />
    </div>
  );
}

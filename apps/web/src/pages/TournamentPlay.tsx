import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Session, SessionOption } from '@hoesikplate/shared';
import { sessionApi } from '../lib/api';
import { getErrorMessage } from '../lib/error';

interface MatchPair {
  left: SessionOption;
  right: SessionOption;
}

const shuffleOptions = (options: SessionOption[]): SessionOption[] => {
  const shuffled = [...options];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const temp = shuffled[index];
    shuffled[index] = shuffled[randomIndex];
    shuffled[randomIndex] = temp;
  }
  return shuffled;
};

export default function TournamentPlay() {
  const { teamId, sessionId } = useParams<{ teamId: string; sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<(Session & { options: SessionOption[] }) | null>(null);
  const [rounds, setRounds] = useState<SessionOption[][]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [matchIndex, setMatchIndex] = useState(0);
  const [winner, setWinner] = useState<SessionOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    sessionApi
      .getById(sessionId)
      .then((sessionData) => {
        setSession(sessionData);
        setRounds([shuffleOptions(sessionData.options)]);
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, '세션을 불러오지 못했습니다.'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sessionId]);

  const currentOptions = rounds[currentRound] || [];
  const hasBye = currentOptions.length % 2 === 1;
  const byeOption = hasBye ? currentOptions[currentOptions.length - 1] : null;
  const totalInRound = Math.floor(currentOptions.length / 2);
  const currentPair: MatchPair | null =
    currentOptions.length >= 2 && matchIndex * 2 + 1 < currentOptions.length
      ? {
          left: currentOptions[matchIndex * 2],
          right: currentOptions[matchIndex * 2 + 1],
        }
      : null;

  const getRoundName = useCallback((count: number) => {
    if (count === 2) {
      return '결승';
    }
    if (count === 4) {
      return '준결승';
    }
    return `${count}강`;
  }, []);

  const handleSelect = async (selected: SessionOption) => {
    if (!sessionId) {
      return;
    }

    try {
      await sessionApi.vote(sessionId, { optionId: selected.id, round: currentRound + 1 });
    } catch (err: unknown) {
      setError(getErrorMessage(err, '투표 저장에 실패했습니다.'));
    }

    const nextWinners = [...(rounds[currentRound + 1] || []), selected];

    if (matchIndex + 1 >= totalInRound) {
      const allWinners = byeOption ? [...nextWinners, byeOption] : nextWinners;

      if (allWinners.length === 1) {
        setWinner(allWinners[0]);
        try {
          await sessionApi.complete(sessionId, allWinners[0].name);
        } catch (err: unknown) {
          setError(getErrorMessage(err, '세션 완료 처리에 실패했습니다.'));
        }
      } else {
        setRounds([...rounds.slice(0, currentRound + 1), allWinners]);
        setCurrentRound(currentRound + 1);
        setMatchIndex(0);
      }
      return;
    }

    setRounds([...rounds.slice(0, currentRound + 1), nextWinners]);
    setMatchIndex(matchIndex + 1);
  };

  if (loading) {
    return <p className="text-gray-400">로딩 중...</p>;
  }

  if (!session) {
    return <p className="text-red-500">{error || '세션을 찾을 수 없습니다.'}</p>;
  }

  if (winner) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <p className="text-gray-500 text-sm mb-2">우승!</p>
        <h2 className="text-3xl font-bold mb-2">{winner.name}</h2>
        {session.title && <p className="text-gray-500 mb-8">{session.title}</p>}
        <button
          onClick={() => navigate(`/teams/${teamId}`)}
          className="px-6 py-3 rounded-xl text-white font-semibold"
          style={{ backgroundColor: '#3182f6' }}
        >
          팀으로 돌아가기
        </button>
      </div>
    );
  }

  if (!currentPair) {
    return <p className="text-gray-400">준비 중...</p>;
  }

  return (
    <div className="max-w-lg mx-auto">
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="text-center mb-6">
        {session.title && <p className="text-sm text-gray-500 mb-1">{session.title}</p>}
        <h2 className="text-xl font-bold">{getRoundName(currentOptions.length)}</h2>
        <p className="text-sm text-gray-400">
          {matchIndex + 1} / {totalInRound}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            void handleSelect(currentPair.left);
          }}
          className="flex-1 bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-[#3182f6] hover:bg-blue-50 transition-all"
        >
          <p className="text-lg font-bold">{currentPair.left.name}</p>
          {currentPair.left.restaurant?.category && (
            <p className="text-sm text-gray-400 mt-1">{currentPair.left.restaurant.category}</p>
          )}
        </button>

        <p className="text-2xl font-bold text-gray-300 flex-shrink-0">VS</p>

        <button
          onClick={() => {
            void handleSelect(currentPair.right);
          }}
          className="flex-1 bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-[#3182f6] hover:bg-blue-50 transition-all"
        >
          <p className="text-lg font-bold">{currentPair.right.name}</p>
          {currentPair.right.restaurant?.category && (
            <p className="text-sm text-gray-400 mt-1">{currentPair.right.restaurant.category}</p>
          )}
        </button>
      </div>

      {byeOption && (
        <div className="mt-4 text-center text-sm text-gray-400">
          <span className="font-medium text-gray-500">{byeOption.name}</span> 부전승으로 다음 라운드 진출
        </div>
      )}
    </div>
  );
}

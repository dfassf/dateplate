import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Session, SessionOption } from '@hoesikplate/shared';
import { sessionApi } from '../lib/api';
import { getErrorMessage } from '../lib/error';

const COLORS = ['#3182f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function RoulettePlay() {
  const { teamId, sessionId } = useParams<{ teamId: string; sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<(Session & { options: SessionOption[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<SessionOption | null>(null);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    sessionApi
      .getById(sessionId)
      .then((sessionData) => {
        setSession(sessionData);
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, '세션을 불러오지 못했습니다.'));
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      if (spinTimerRef.current) {
        clearTimeout(spinTimerRef.current);
      }
    };
  }, [sessionId]);

  useEffect(() => {
    if (!session?.options.length || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const size = 300;
    canvas.width = size;
    canvas.height = size;

    const center = size / 2;
    const radius = center - 10;
    const sliceAngle = (2 * Math.PI) / session.options.length;

    context.clearRect(0, 0, size, size);

    session.options.forEach((option, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      context.beginPath();
      context.moveTo(center, center);
      context.arc(center, center, radius, startAngle, endAngle);
      context.closePath();
      context.fillStyle = COLORS[index % COLORS.length];
      context.fill();
      context.strokeStyle = '#fff';
      context.lineWidth = 2;
      context.stroke();

      context.save();
      context.translate(center, center);
      context.rotate(startAngle + sliceAngle / 2);
      context.textAlign = 'center';
      context.fillStyle = '#fff';
      context.font = 'bold 13px sans-serif';
      const label = option.name.length > 6 ? `${option.name.slice(0, 6)}…` : option.name;
      context.fillText(label, radius * 0.6, 5);
      context.restore();
    });
  }, [session]);

  const handleSpin = async () => {
    if (!sessionId || !session || spinning) {
      return;
    }

    setSpinning(true);
    setError('');

    try {
      const result = await sessionApi.spin(sessionId);
      const winnerOption = result.winner;

      const winnerIndex = session.options.findIndex((option) => option.id === winnerOption.id);
      const sliceAngle = 360 / session.options.length;
      const targetAngle = 360 - winnerIndex * sliceAngle - sliceAngle / 2;
      const spins = 5 * 360 + targetAngle;

      setRotation((previous) => previous + spins);

      if (spinTimerRef.current) {
        clearTimeout(spinTimerRef.current);
      }

      spinTimerRef.current = setTimeout(() => {
        setWinner(winnerOption);
        setSpinning(false);
      }, 3500);
    } catch (err: unknown) {
      setSpinning(false);
      setError(getErrorMessage(err, '스핀에 실패했습니다.'));
    }
  };

  if (loading) {
    return <p className="text-gray-400">로딩 중...</p>;
  }

  if (!session) {
    return <p className="text-red-500">{error || '세션을 찾을 수 없습니다.'}</p>;
  }

  return (
    <div className="max-w-lg mx-auto text-center">
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {session.title && <p className="text-sm text-gray-500 mb-1">{session.title}</p>}
      <h2 className="text-xl font-bold mb-6">룰렛</h2>

      <div className="relative inline-block mb-2">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '20px solid #ef4444',
            }}
          />
        </div>

        <canvas
          ref={canvasRef}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : undefined,
          }}
          className="rounded-full"
        />
      </div>

      {winner ? (
        <div className="mt-6">
          <p className="text-gray-500 text-sm mb-1">결과</p>
          <h3 className="text-2xl font-bold mb-6">{winner.name}</h3>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setWinner(null);
                setRotation(0);
              }}
              className="px-6 py-3 rounded-xl border text-sm font-semibold"
              style={{ borderColor: '#3182f6', color: '#3182f6' }}
            >
              다시 돌리기
            </button>
            <button
              onClick={() => navigate(`/teams/${teamId}`)}
              className="px-6 py-3 rounded-xl text-white text-sm font-semibold"
              style={{ backgroundColor: '#3182f6' }}
            >
              팀으로 돌아가기
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <button
            onClick={() => {
              void handleSpin();
            }}
            disabled={spinning}
            className="px-8 py-3 rounded-xl text-white font-semibold disabled:opacity-50"
            style={{ backgroundColor: '#3182f6' }}
          >
            {spinning ? '돌리는 중...' : '돌리기!'}
          </button>
        </div>
      )}

      <div className="mt-8 space-y-2">
        {session.options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className={winner?.id === option.id ? 'font-bold' : ''}>{option.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

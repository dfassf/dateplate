import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { couplesApi, type CoupleResponse, type PendingInvite } from '../lib/api';

export default function Couple() {
  const navigate = useNavigate();
  const [couple, setCouple] = useState<CoupleResponse | null>(null);
  const [pendingInvite, setPendingInvite] = useState<PendingInvite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 초대 생성 폼
  const [coupleName, setCoupleName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // 초대 수락 폼
  const [inviteCode, setInviteCode] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [coupleData, inviteData] = await Promise.all([
        couplesApi.getMyCouple(),
        couplesApi.getMyPendingInvite(),
      ]);
      setCouple(coupleData);
      setPendingInvite(inviteData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);
    try {
      const result = await couplesApi.createInvite(coupleName || undefined);
      setPendingInvite({
        id: '',
        inviteCode: result.inviteCode,
        coupleName: coupleName || null,
        expiresAt: result.expiresAt,
      });
      setCoupleName('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '초대 코드 생성 실패');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAccepting(true);
    try {
      const result = await couplesApi.acceptInvite(inviteCode.toUpperCase());
      setCouple(result);
      setPendingInvite(null);
      setInviteCode('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '초대 수락 실패');
    } finally {
      setIsAccepting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('초대 코드가 복사되었습니다!');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  // 이미 커플인 경우
  if (couple) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💑</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {couple.name || '우리 커플'}
            </h1>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">파트너 1</span>
              <span className="font-medium">{couple.user1.name}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">파트너 2</span>
              <span className="font-medium">{couple.user2.name}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full mt-6 px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
          >
            대시보드로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">커플 연결</h1>
        <p className="text-gray-600">
          파트너와 연결하여 함께 데이트를 기록하세요
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* 이미 생성한 초대가 있는 경우 */}
      {pendingInvite && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            초대 코드가 생성되었습니다
          </h2>
          <div className="bg-pink-50 rounded-lg p-4 mb-4">
            <div className="text-center">
              <span className="text-3xl font-mono font-bold text-pink-600 tracking-wider">
                {pendingInvite.inviteCode}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            이 코드를 파트너에게 공유하세요. 24시간 후 만료됩니다.
          </p>
          <button
            onClick={() => copyToClipboard(pendingInvite.inviteCode)}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            코드 복사하기
          </button>
        </div>
      )}

      {/* 초대 코드 생성 */}
      {!pendingInvite && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            초대 코드 생성
          </h2>
          <form onSubmit={handleCreateInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                커플 이름 (선택)
              </label>
              <input
                type="text"
                value={coupleName}
                onChange={(e) => setCoupleName(e.target.value)}
                placeholder="예: 우리 커플"
                maxLength={50}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={isCreating}
              className="w-full px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
            >
              {isCreating ? '생성 중...' : '초대 코드 생성'}
            </button>
          </form>
        </div>
      )}

      {/* 구분선 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">또는</span>
        </div>
      </div>

      {/* 초대 코드 입력 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          초대 코드 입력
        </h2>
        <form onSubmit={handleAcceptInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              초대 코드
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="8자리 코드 입력"
              maxLength={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono text-center text-lg tracking-wider"
            />
          </div>
          <button
            type="submit"
            disabled={isAccepting || inviteCode.length !== 8}
            className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
          >
            {isAccepting ? '연결 중...' : '커플 연결하기'}
          </button>
        </form>
      </div>
    </div>
  );
}

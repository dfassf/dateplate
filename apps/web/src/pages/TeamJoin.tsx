import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamApi } from '../lib/api';

export default function TeamJoin() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await teamApi.acceptInvite(code);
      navigate(`/teams/${res.data.data.id}`);
    } catch {
      setError('초대 코드가 유효하지 않거나 만료되었습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">팀 합류</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">초대 코드</label>
          <input
            type="text"
            placeholder="팀장에게 받은 초대 코드를 입력하세요"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#3182f6] text-sm"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
          style={{ backgroundColor: '#3182f6' }}
        >
          {loading ? '합류 중...' : '팀 합류하기'}
        </button>
      </form>
    </div>
  );
}

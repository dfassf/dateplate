import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamApi } from '../lib/api';

export default function TeamCreate() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await teamApi.create({ name });
      navigate(`/teams/${res.data.data.id}`);
    } catch {
      setError('팀 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">팀 만들기</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">팀 이름</label>
          <input
            type="text"
            placeholder="예: LG전자 마곡 개발팀"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          {loading ? '생성 중...' : '팀 만들기'}
        </button>
      </form>
    </div>
  );
}

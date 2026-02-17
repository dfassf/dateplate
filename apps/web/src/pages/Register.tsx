import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';
import { getErrorMessage } from '../lib/error';
import { useAuthStore } from '../stores/authStore';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!email) {
      setEmailStatus('idle');
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!isValidEmail(email)) {
      setEmailStatus('invalid');
      return;
    }

    setEmailStatus('checking');
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await authApi.checkEmail(email);
        setEmailStatus(result.available ? 'available' : 'taken');
      } catch {
        setEmailStatus('idle');
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [email]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const registerResult = await authApi.register({ email, password, name });
      setAuth(registerResult.user, registerResult.accessToken);
      navigate('/register/company', { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, '회원가입에 실패했습니다. 이미 존재하는 이메일일 수 있습니다.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm px-6">
        <h1 className="text-2xl font-bold text-center mb-8" style={{ color: '#3182f6' }}>
          회원가입
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#3182f6] text-sm"
          />

          <div>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none text-sm ${
                emailStatus === 'taken' || emailStatus === 'invalid'
                  ? 'border-red-400 focus:border-red-400'
                  : emailStatus === 'available'
                    ? 'border-green-400 focus:border-green-400'
                    : 'border-gray-300 focus:border-[#3182f6]'
              }`}
            />
            {emailStatus === 'invalid' && <p className="text-red-500 text-xs mt-1">올바른 이메일 형식이 아닙니다</p>}
            {emailStatus === 'taken' && <p className="text-red-500 text-xs mt-1">이미 사용 중인 이메일입니다</p>}
            {emailStatus === 'available' && <p className="text-green-500 text-xs mt-1">사용 가능한 이메일입니다</p>}
            {emailStatus === 'checking' && <p className="text-gray-400 text-xs mt-1">확인 중...</p>}
          </div>

          <input
            type="password"
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#3182f6] text-sm"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || emailStatus === 'taken' || emailStatus === 'invalid' || emailStatus === 'checking'}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
            style={{ backgroundColor: '#3182f6' }}
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="font-semibold" style={{ color: '#3182f6' }}>
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

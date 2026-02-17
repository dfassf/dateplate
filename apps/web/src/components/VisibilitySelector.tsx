import type { ReviewVisibility } from '@hoesikplate/shared';

const OPTIONS = [
  { value: 'PRIVATE' as const, label: '비공개', desc: '팀 내부만' },
  { value: 'COMMUNITY' as const, label: '커뮤니티', desc: '로그인 사용자' },
  { value: 'PUBLIC' as const, label: '전체 공개', desc: '누구나' },
];

interface VisibilitySelectorProps {
  value: ReviewVisibility;
  onChange: (visibility: ReviewVisibility) => void;
}

export function VisibilitySelector({ value, onChange }: VisibilitySelectorProps) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-3 py-2 rounded-xl border text-sm transition-colors ${
            value === opt.value ? 'border-[#3182f6] bg-blue-50' : 'border-gray-200'
          }`}
        >
          <p
            className={`font-medium ${value === opt.value ? '' : 'text-gray-700'}`}
            style={value === opt.value ? { color: '#3182f6' } : undefined}
          >
            {opt.label}
          </p>
          <p className="text-xs text-gray-400">{opt.desc}</p>
        </button>
      ))}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { statsApi } from '../lib/api';
import { getErrorMessage } from '../lib/error';

interface Stats {
  totalDinners: number;
  totalAmount: number;
  avgPerPerson: number;
  monthlySpending: { month: string; amount: number; count: number }[];
  categoryDistribution: { category: string; count: number }[];
  memberParticipation: { name: string; count: number }[];
  totalReviews: number;
  avgRating: number;
}

const CATEGORY_COLORS = ['#3182f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function TeamStats() {
  const { teamId } = useParams<{ teamId: string }>();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    statsApi
      .getTeamStats(teamId)
      .then((result) => {
        setStats(result);
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, '통계 데이터를 불러올 수 없습니다.'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [teamId]);

  if (loading) {
    return <p className="text-gray-400">로딩 중...</p>;
  }

  if (!stats) {
    return <p className="text-red-500">{error || '통계 데이터를 불러올 수 없습니다.'}</p>;
  }

  const maxMonthlyAmount = Math.max(...stats.monthlySpending.map((monthly) => monthly.amount), 1);
  const totalCategoryCount = stats.categoryDistribution.reduce((sum, category) => sum + category.count, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">팀 통계</h2>
        <Link to={`/teams/${teamId}`} className="text-sm font-medium" style={{ color: '#3182f6' }}>
          팀으로 돌아가기
        </Link>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-2 gap-3 mb-8">
        {[
          { label: '총 회식', value: `${stats.totalDinners}회` },
          { label: '총 지출', value: `${stats.totalAmount.toLocaleString()}원` },
          { label: '인당 평균', value: `${stats.avgPerPerson.toLocaleString()}원` },
          { label: '평균 평점', value: stats.avgRating > 0 ? `★ ${stats.avgRating}` : '-' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-400">{item.label}</p>
            <p className="text-lg font-bold mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {stats.monthlySpending.length > 0 && (
        <section className="mb-8">
          <h3 className="font-semibold text-gray-700 mb-3">월별 지출</h3>
          <div className="bg-white rounded-xl border p-4">
            <div className="space-y-3">
              {stats.monthlySpending.slice(-6).map((monthly) => (
                <div key={monthly.month} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-14 flex-shrink-0">{monthly.month}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(monthly.amount / maxMonthlyAmount) * 100}%`,
                        backgroundColor: '#3182f6',
                        minWidth: monthly.amount > 0 ? '20px' : '0',
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-20 text-right flex-shrink-0">
                    {monthly.amount.toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {stats.categoryDistribution.length > 0 && (
        <section className="mb-8">
          <h3 className="font-semibold text-gray-700 mb-3">카테고리 분포</h3>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex rounded-full overflow-hidden h-8 mb-3">
              {stats.categoryDistribution.map((category, index) => (
                <div
                  key={category.category}
                  style={{
                    width: `${(category.count / totalCategoryCount) * 100}%`,
                    backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                  }}
                  title={`${category.category}: ${category.count}회`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {stats.categoryDistribution.map((category, index) => (
                <div key={category.category} className="flex items-center gap-1.5 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                  />
                  <span className="text-gray-600">{category.category}</span>
                  <span className="text-gray-400">{category.count}회</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {stats.memberParticipation.length > 0 && (
        <section className="mb-8">
          <h3 className="font-semibold text-gray-700 mb-3">멤버 리뷰 활동</h3>
          <div className="bg-white rounded-xl border divide-y">
            {stats.memberParticipation.map((member, index) => (
              <div key={member.name} className="px-4 py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: index < 3 ? '#3182f6' : '#e5e7eb',
                      color: index < 3 ? '#fff' : '#6b7280',
                    }}
                  >
                    {index + 1}
                  </span>
                  <span className="font-medium">{member.name}</span>
                </div>
                <span className="text-gray-500">{member.count}개 리뷰</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStats } from '../../api/admin.js';

export default function StatsPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useAdminStats();

  const analyticsCards = [
    { label: 'Interactions', value: stats?.analytics.total_interactions ?? 0 },
    { label: 'Users (all)', value: stats?.analytics.unique_users ?? 0 },
    { label: 'Users (7d)', value: stats?.analytics.unique_users_7d ?? 0 },
    { label: 'Users (30d)', value: stats?.analytics.unique_users_30d ?? 0 },
  ];

  const typeBreakdown = useMemo(() => {
    return Object.entries(stats?.analytics.type_breakdown ?? {}).sort((a, b) => b[1] - a[1]);
  }, [stats?.analytics.type_breakdown]);

  return (
    <div className="flex flex-col gap-6 px-4 py-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-elevated focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          style={{ minHeight: '44px' }}
        >
          Back
        </button>
        <h1 className="font-serif text-3xl font-bold text-accent">Stats</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {analyticsCards.map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-bg-card p-4">
            <div className="text-2xl font-bold text-accent">{isLoading ? '...' : item.value}</div>
            <div className="mt-1 text-xs text-text-secondary">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-bg-card p-4">
          <h2 className="font-serif text-lg font-bold text-text-primary">Top Pages</h2>
          <div className="mt-3 space-y-2">
            {(stats?.analytics.top_pages ?? []).length === 0 ? (
              <p className="text-sm text-text-secondary">No interaction data yet</p>
            ) : (
              stats?.analytics.top_pages.map((row) => (
                <div key={row.page} className="flex items-center justify-between text-sm">
                  <span className="truncate text-text-primary">{row.page}</span>
                  <span className="text-text-secondary">{row.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-bg-card p-4">
          <h2 className="font-serif text-lg font-bold text-text-primary">Type Breakdown</h2>
          <div className="mt-3 space-y-2">
            {typeBreakdown.length === 0 ? (
              <p className="text-sm text-text-secondary">No interaction data yet</p>
            ) : (
              typeBreakdown.map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className="text-text-primary">{type}</span>
                  <span className="text-text-secondary">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

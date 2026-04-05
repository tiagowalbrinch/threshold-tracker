import { useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCatalogItem } from '../../api/catalog';
import { getLeaderboard } from '../../api/leaderboard';
import { useAuth } from '../../context/AuthContext';
import { LeaderboardEntry } from '../../models/task';

const DATE_RANGE_OPTIONS = [
  { value: 'all',           label: 'All time' },
  { value: 'last_7_days',   label: 'Last 7 days' },
  { value: 'last_30_days',  label: 'Last month' },
  { value: 'last_3_months', label: 'Last 3 months' },
];

function dateRangeToParams(range: string): { from?: string; to?: string } {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const daysAgo = (n: number) => { const d = new Date(now); d.setDate(d.getDate() - n); d.setHours(0,0,0,0); return d; };
  const monthsAgo = (n: number) => { const d = new Date(now); d.setMonth(d.getMonth() - n); d.setHours(0,0,0,0); return d; };
  switch (range) {
    case 'last_7_days':   return { from: fmt(daysAgo(7)) };
    case 'last_30_days':  return { from: fmt(daysAgo(30)) };
    case 'last_3_months': return { from: fmt(monthsAgo(3)) };
    default:              return {};
  }
}

function trendLabel(delta?: number): string {
  if (delta == null) return '';
  if (Math.abs(delta) < 10) return '→';
  return delta > 0 ? '↑' : '↓';
}

function trendClass(delta?: number): string {
  if (delta == null || Math.abs(delta) < 10) return 'text-white/30';
  return delta > 0 ? 'text-emerald-400' : 'text-rose-400';
}

export function TaskDetailsPublic() {
  const { id: taskId = '' } = useParams();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const dateRange = searchParams.get('range') ?? 'all';
  const sortByImproving = searchParams.get('sort') === 'improving';

  function setDateRange(value: string) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value && value !== 'all') next.set('range', value);
      else next.delete('range');
      return next;
    }, { replace: true });
  }

  function toggleSort() {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (sortByImproving) next.delete('sort');
      else next.set('sort', 'improving');
      return next;
    }, { replace: true });
  }

  const { data: taskInfo } = useQuery({
    queryKey: ['catalog-item', taskId],
    queryFn: () => getCatalogItem(taskId),
    enabled: !!taskId,
  });

  const { from, to } = dateRangeToParams(dateRange);
  const { data: entries = [], isLoading: loading } = useQuery({
    queryKey: ['leaderboard', taskId, from, to],
    queryFn: () => getLeaderboard(taskId, from, to),
    enabled: !!taskId,
  });

  const sortedEntries = useMemo((): LeaderboardEntry[] => {
    const list = [...entries];
    if (sortByImproving) {
      return list.sort((a, b) => (b.trend_delta ?? -Infinity) - (a.trend_delta ?? -Infinity));
    }
    return list;
  }, [entries, sortByImproving]);

  function onClickEntry() {
    if (isLoggedIn) {
      navigate(`/task/${taskId}`);
    } else {
      navigate(`/login`, { state: { from: { pathname: `/task/${taskId}` } } });
    }
  }

  function rankColor(i: number) {
    if (i === 0) return 'text-amber-400 font-bold';
    if (i === 1) return 'text-slate-300 font-bold';
    if (i === 2) return 'text-amber-700 font-bold';
    return 'text-white/30';
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {taskInfo?.task_name ?? taskId}
            </h1>
            <span className="text-white/30 text-sm capitalize">{taskInfo?.category ?? ''}</span>
          </div>
        </div>

        {!isLoggedIn ? (
          <Link to="/login" state={{ from: { pathname: `/task/${taskId}` } }}
            className="shrink-0 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg font-medium transition-colors">
            Login to see your data
          </Link>
        ) : (
          <Link to={`/task/${taskId}`}
            className="shrink-0 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg font-medium transition-colors">
            My data
          </Link>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {DATE_RANGE_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setDateRange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                dateRange === opt.value ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white/60'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>

        <button onClick={toggleSort}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
            sortByImproving
              ? 'border-emerald-500/40 text-emerald-400'
              : 'border-white/10 text-white/40'
          }`}>
          ↑ Most improving
        </button>
      </div>

      {/* Leaderboard table */}
      <div className="bg-white/[0.03] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-5 h-5 border-2 border-white/20 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : sortedEntries.length === 0 ? (
          <div className="py-12 text-center text-white/20 text-sm">No entries for this period</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/30 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="text-left py-3 px-5 font-medium">#</th>
                <th className="text-left py-3 px-4 font-medium">Player</th>
                <th className="text-right py-3 px-4 font-medium">Best Score</th>
                <th className="text-right py-3 px-4 font-medium">Threshold</th>
                <th className="text-right py-3 px-4 font-medium">Trend</th>
                <th className="text-right py-3 px-5 font-medium">Plays</th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((entry, i) => (
                <tr key={entry.display_name} onClick={onClickEntry}
                  className="border-b border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <td className="py-3 px-5"><span className={rankColor(i)}>{i + 1}</span></td>
                  <td className="py-3 px-4 text-white font-medium">{entry.display_name}</td>
                  <td className="py-3 px-4 text-right text-violet-400 font-bold">{entry.personal_best.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-amber-400/80">
                    {entry.last_threshold ? entry.last_threshold.toLocaleString() : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-bold text-base ${trendClass(entry.trend_delta)}`}>
                      {trendLabel(entry.trend_delta)}
                    </span>
                    {entry.trend_delta != null && Math.abs(entry.trend_delta) >= 10 && (
                      <span className="text-white/20 text-xs ml-1">
                        {entry.trend_delta > 0 ? '+' : ''}{entry.trend_delta}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-5 text-right text-white/40">{entry.play_count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

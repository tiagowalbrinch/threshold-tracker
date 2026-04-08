import { useMemo } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, setTaskThreshold } from '../../api/tasks';
import { getScores } from '../../api/scores';
import { syncTask } from '../../api/sync';
import { getLeaderboard } from '../../api/leaderboard';
import { ThresholdIndicator } from '../../components/ThresholdIndicator';
import { ThresholdSettings } from '../../components/ThresholdSettings';
import { ScoreChart } from '../../components/ScoreChart';
import { ScoreHistoryTable } from '../../components/ScoreHistoryTable';
import { StatsOverview } from '../../components/StatsOverview';
import { DateRangeSelect } from '../../components/DateRangeSelect';
import { dateRangeToParams } from '../../utils/dateRange';

export function TaskDetailsLogged() {
  const { id: taskId = '' } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { from?: string } };
  const backTo = state?.from ?? '/dashboard';
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showLeaderboard, setShowLeaderboard] = [
    searchParams.get('leaderboard') === '1',
    (v: boolean) => setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (v) next.set('leaderboard', '1');
      else next.delete('leaderboard');
      return next;
    }, { replace: true }),
  ];
  const dateRange = searchParams.get('range') ?? 'all';
  const setDateRange = (v: string) => setSearchParams(prev => {
    const next = new URLSearchParams(prev);
    if (v && v !== 'all') next.set('range', v);
    else next.delete('range');
    return next;
  }, { replace: true });

  // Queries
  const { data: task, isLoading: loadingTask } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(taskId),
    enabled: !!taskId,
  });

  const { data: rawScores = [], isLoading: loadingScores } = useQuery({
    queryKey: ['scores', taskId],
    queryFn: () => getScores(taskId),
    enabled: !!taskId,
    refetchInterval: 60_000,
  });

  const { data: leaderboardEntries = [], isLoading: loadingLeaderboard } = useQuery({
    queryKey: ['leaderboard', taskId],
    queryFn: () => getLeaderboard(taskId),
    enabled: showLeaderboard,
  });

  const scores = useMemo(() =>
    [...rawScores].sort((a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime()),
    [rawScores]
  );

  const loading = loadingTask || loadingScores;

  // Mutations
  const setThresholdMutation = useMutation({
    mutationFn: ({ value, autosyncEnabled }: { value: number; autosyncEnabled: boolean }) =>
      setTaskThreshold(taskId, value, autosyncEnabled),
    onSuccess: updated => queryClient.setQueryData(['task', taskId], updated),
  });

  const syncTaskMutation = useMutation({
    mutationFn: () => syncTask(taskId),
    onSuccess: updated => queryClient.setQueryData(['task', taskId], updated),
  });

  const latestScore = useMemo(() =>
    scores.length > 0 ? scores[scores.length - 1].score : 0,
    [scores]
  );

  const beatThresholdToday = useMemo(() => {
    const today = new Date().toDateString();
    const threshold = task?.threshold_value;
    if (!threshold) return false;
    return scores.some(s => new Date(s.played_at).toDateString() === today && s.score >= threshold);
  }, [scores, task?.threshold_value]);

  const { from, to } = dateRangeToParams(dateRange);
  const chartScores = useMemo(() => {
    if (!from && !to) return scores;
    return scores.filter(s => {
      const t = new Date(s.played_at).getTime();
      if (from && t < new Date(from).getTime()) return false;
      if (to && t > new Date(to + 'T23:59:59').getTime()) return false;
      return true;
    });
  }, [scores, from, to]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/5 rounded w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
          </div>
          <div className="h-64 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!task) return null;

  function rankColor(i: number) {
    if (i === 0) return 'text-amber-400 font-bold';
    if (i === 1) return 'text-slate-300 font-bold';
    if (i === 2) return 'text-amber-700 font-bold';
    return 'text-white/30';
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Beat threshold banner */}
      {beatThresholdToday && (
        <div className="mb-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-3">
          <span className="text-emerald-400 text-lg">🎯</span>
          <p className="text-emerald-400 font-medium">You beat your threshold today!</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link to={backTo} className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{task.task_name}</h1>
            <span className="text-white/30 text-sm capitalize">{task.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 pl-11 sm:pl-0">
          <button onClick={() => syncTaskMutation.mutate()} disabled={syncTaskMutation.isPending}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-40 rounded-lg transition-colors" title="Recalculate stats">
            {syncTaskMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Threshold section */}
      <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">Threshold</h2>
          {task.threshold_value && (
            <span className="text-2xl font-bold text-violet-400">{task.threshold_value.toLocaleString()}</span>
          )}
        </div>
        <ThresholdIndicator
          threshold={task.threshold_value ?? 0}
          personalBest={task.personal_best ?? 0}
          latestScore={latestScore}
          scores={scores}
        />
        <div className="mt-5 pt-5 border-t border-white/5">
          <ThresholdSettings
            task={task}
            onSave={({ value, autosyncEnabled }) => setThresholdMutation.mutate({ value, autosyncEnabled })}
          />
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">Score History</h2>
          <DateRangeSelect value={dateRange} onChange={setDateRange} />
        </div>
        <ScoreChart scores={chartScores} threshold={task.threshold_value ?? 0} />
      </div>

      {/* Stats */}
      <div className="mb-6">
        <StatsOverview scores={scores} threshold={task.threshold_value ?? 0} personalBest={task.personal_best ?? 0} />
      </div>

      {/* Attempts Table */}
      <div className="bg-white/[0.03] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">Attempts</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/task/${taskId}/leaderboard`)}
              className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Public Leaderboard
            </button>
            <button onClick={() => setShowLeaderboard(true)}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
              Leaderboard
            </button>
          </div>
        </div>
        <ScoreHistoryTable scores={scores} threshold={task.threshold_value ?? 0} />
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowLeaderboard(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-[#0f0f17] border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div>
                <h3 className="text-white font-semibold">Leaderboard</h3>
                <p className="text-white/30 text-xs mt-0.5 truncate max-w-xs">{task.task_name}</p>
              </div>
              <button onClick={() => setShowLeaderboard(false)}
                className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {loadingLeaderboard ? (
                <div className="py-12 flex justify-center">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-violet-500 rounded-full animate-spin" />
                </div>
              ) : leaderboardEntries.length === 0 ? (
                <div className="py-12 text-center text-white/20 text-sm">No entries yet</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/30 text-xs uppercase tracking-wider border-b border-white/5">
                      <th className="text-left py-3 px-5 font-medium">#</th>
                      <th className="text-left py-3 px-4 font-medium">Player</th>
                      <th className="text-right py-3 px-4 font-medium">PB</th>
                      <th className="text-right py-3 px-5 font-medium">Plays</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardEntries.map((entry, i) => (
                      <tr key={entry.display_name} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-5"><span className={rankColor(i)}>{i + 1}</span></td>
                        <td className="py-3 px-4 text-white font-medium">{entry.display_name}</td>
                        <td className="py-3 px-4 text-right text-violet-400 font-bold">{entry.personal_best.toLocaleString()}</td>
                        <td className="py-3 px-5 text-right text-white/40">{entry.play_count.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

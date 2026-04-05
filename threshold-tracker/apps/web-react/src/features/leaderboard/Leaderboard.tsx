import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getTasks } from '../../api/tasks';
import { getLeaderboard } from '../../api/leaderboard';
import { UserTaskStat, LeaderboardEntry } from '../../models/task';
import { useAuth } from '../../context/AuthContext';

export function Leaderboard() {
  const { isLoggedIn } = useAuth();
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<UserTaskStat[]>([]);
  const [selectedTask, setSelectedTask] = useState<UserTaskStat | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  async function onSearchInput(value: string) {
    setSearch(value);
    if (!value.trim()) { setSuggestions([]); return; }
    const tasks = await getTasks({ name: value }).catch(() => []);
    setSuggestions(tasks.slice(0, 8));
  }

  async function selectTask(task: UserTaskStat) {
    setSelectedTask(task);
    setSearch(task.task_name);
    setSuggestions([]);
    setLoading(true);
    const data = await getLeaderboard(task.aimlabs_task_id).catch(() => []);
    setEntries(data);
    setLoading(false);
  }

  function rankColor(i: number) {
    if (i === 0) return 'text-amber-400 font-bold';
    if (i === 1) return 'text-white/50 font-bold';
    if (i === 2) return 'text-amber-700 font-bold';
    return 'text-white/30';
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/dashboard" className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
          <p className="text-white/30 text-sm">See how ThresholdTracker users rank on any task</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <input
          value={search}
          onChange={e => onSearchInput(e.target.value)}
          placeholder="Search for a task..."
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 outline-none focus:border-white/20"
        />
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f0f17] border border-white/10 rounded-xl overflow-hidden z-10">
            {suggestions.map(t => (
              <button key={t.aimlabs_task_id} onClick={() => selectTask(t)}
                className="w-full text-left px-4 py-3 hover:bg-white/5 text-white text-sm border-b border-white/5 last:border-0 transition-colors">
                <span className="font-medium">{t.task_name}</span>
                <span className="text-white/30 text-xs ml-2 capitalize">{t.category}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="animate-pulse space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-white/5 rounded-xl" />)}
        </div>
      )}

      {!loading && selectedTask && entries.length === 0 && (
        <div className="text-center py-16 text-white/30 text-sm">
          No ThresholdTracker users have synced this task yet.
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold">{selectedTask!.task_name}</h2>
              <p className="text-white/30 text-xs capitalize">{selectedTask!.category}</p>
            </div>
            {isLoggedIn && (
              <Link to={`/task/${selectedTask!.aimlabs_task_id}`}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                My stats →
              </Link>
            )}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/30 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="text-left py-3 px-4 font-medium">Rank</th>
                <th className="text-left py-3 px-4 font-medium">Player</th>
                <th className="text-right py-3 px-4 font-medium">PB</th>
                <th className="text-right py-3 px-4 font-medium">Plays</th>
                <th className="text-right py-3 px-4 font-medium">Synced</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr key={entry.display_name} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4"><span className={rankColor(i)}>{i + 1}</span></td>
                  <td className="py-3 px-4 text-white font-medium">{entry.display_name}</td>
                  <td className="py-3 px-4 text-right text-cyan-400 font-bold">{entry.personal_best.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-white/40">{entry.play_count.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-white/20 text-xs">{format(new Date(entry.synced_at), 'dd/MM/yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !selectedTask && (
        <div className="text-center py-16 text-white/20 text-sm">
          Search for a task above to see the leaderboard.
        </div>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { TaskCatalogItem } from '../models/task';
import { categoryColorClass, categoryTextColor } from '../utils/categoryColors';

export function TaskCatalogCard({ task }: { task: TaskCatalogItem }) {
  const colorClass = categoryColorClass(task.category);
  const textColor = categoryTextColor(task.category);
  const avgScoreDisplay = task.avg_score ? Math.round(task.avg_score).toLocaleString() : '—';

  return (
    <Link to={`/task/${task.aimlabs_task_id}/leaderboard`}>
      <div className={`group relative bg-gradient-to-br border rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300 cursor-pointer ${colorClass}`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl bg-black/30 ${textColor}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/>
              <line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/>
              <line x1="12" y1="22" x2="12" y2="18"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-white/40 uppercase tracking-wider">{task.category}</span>
        </div>

        <h3 className="text-white font-semibold text-lg mb-3 truncate">{task.task_name}</h3>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <p className="text-white/40 text-xs mb-0.5">Best Score</p>
            <p className={`text-base font-bold ${task.best_score ? textColor : 'text-white/20'}`}>
              {task.best_score ? task.best_score.toLocaleString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-white/40 text-xs mb-0.5">Avg Score</p>
            <p className="text-base font-bold text-white/70">{avgScoreDisplay}</p>
          </div>
        </div>

        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          {task.best_player_nick ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-amber-400/60 text-xs">🏆</span>
              <span className="text-white/50 text-xs truncate">{task.best_player_nick}</span>
            </div>
          ) : (
            <span className="text-white/20 text-xs">No plays yet</span>
          )}
          <span className="text-white/30 text-xs shrink-0">
            {task.player_count} {task.player_count === 1 ? 'player' : 'players'}
          </span>
        </div>
      </div>
    </Link>
  );
}

import { Link } from 'react-router-dom';
import { UserTaskStat } from '../models/task';
import { categoryColorClass, categoryTextColor } from '../utils/categoryColors';

function getTrend(task: UserTaskStat): 'up' | 'down' | 'stable' | 'none' {
  if (task.last5_avg == null || task.avg_score == null) return 'none';
  const delta = task.last5_avg - task.avg_score;
  if (delta > 50) return 'up';
  if (delta < -50) return 'down';
  return 'stable';
}

export function TaskCard({ task }: { task: UserTaskStat }) {
  const colorClass = categoryColorClass(task.category);
  const textColor = categoryTextColor(task.category);
  const trend = getTrend(task);

  return (
    <Link to={`/task/${task.aimlabs_task_id}`}>
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

        <div className="grid grid-cols-4 gap-2">
          <div>
            <p className="text-white/40 text-xs mb-0.5">Threshold</p>
            <p className={`text-base font-bold ${task.threshold_value ? textColor : 'text-white/20'}`}>
              {task.threshold_value ? task.threshold_value.toLocaleString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-white/40 text-xs mb-0.5">PB</p>
            <p className="text-base font-bold text-white/80">
              {task.personal_best ? task.personal_best.toLocaleString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-white/40 text-xs mb-0.5">Plays</p>
            <p className="text-base font-bold text-white/50">{task.play_count.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs mb-0.5">Trend</p>
            {trend === 'up' && <p className="text-emerald-400 text-base font-bold">↑</p>}
            {trend === 'down' && <p className="text-rose-400 text-base font-bold">↓</p>}
            {(trend === 'stable' || trend === 'none') && <p className="text-white/20 text-base font-bold">—</p>}
          </div>
        </div>
      </div>
    </Link>
  );
}

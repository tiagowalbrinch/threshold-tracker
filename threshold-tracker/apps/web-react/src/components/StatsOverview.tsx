import { useMemo } from 'react';
import { PlayAttempt } from '../models/score';

interface Props {
  scores: PlayAttempt[];
  threshold: number;
  personalBest: number;
}

export function StatsOverview({ scores, threshold, personalBest }: Props) {
  const totalAttempts = scores.length;

  const avgScore = useMemo(() => {
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((s, p) => s + p.score, 0) / scores.length);
  }, [scores]);

  const consistencyPct = useMemo(() => {
    if (!threshold || scores.length === 0) return null;
    const above = scores.filter(s => s.score >= threshold).length;
    return Math.round((above / scores.length) * 100);
  }, [scores, threshold]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Attempts</p>
        <p className="text-white text-xl font-bold">{totalAttempts}</p>
      </div>
      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Average</p>
        <p className="text-white text-xl font-bold">{avgScore > 0 ? avgScore.toLocaleString() : '—'}</p>
      </div>
      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">PB</p>
        <p className="text-white text-xl font-bold">{personalBest ? personalBest.toLocaleString() : '—'}</p>
      </div>
      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Consistency</p>
        <p className="text-white text-xl font-bold">{consistencyPct !== null ? `${consistencyPct}%` : '—'}</p>
      </div>
    </div>
  );
}

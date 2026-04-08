import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { PlayAttempt } from '../models/score';

interface Props {
  scores: PlayAttempt[];
  threshold: number;
}

const PAGE_SIZE = 25;

function isAbove(s: PlayAttempt, threshold: number): boolean {
  if (s.above_threshold != null) return s.above_threshold;
  return threshold > 0 && s.score >= threshold;
}

export function ScoreHistoryTable({ scores, threshold }: Props) {
  const [page, setPage] = useState(1);

  // Reset page when scores change
  useEffect(() => { setPage(1); }, [scores]);

  const totalCount = scores.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const firstItem = (page - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(page * PAGE_SIZE, totalCount);

  const pagedScores = useMemo(() => {
    const all = [...scores].reverse();
    const start = (page - 1) * PAGE_SIZE;
    return all.slice(start, start + PAGE_SIZE);
  }, [scores, page]);

  function loadPage(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }

  if (totalCount === 0) {
    return <div className="text-center py-12 text-white/20 text-sm">No scores recorded yet</div>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/30 text-xs uppercase tracking-wider border-b border-white/5">
              <th className="text-left py-3 px-4 font-medium">#</th>
              <th className="text-left py-3 px-4 font-medium">Score</th>
              {threshold > 0 && <th className="text-center py-3 px-2 font-medium">THR</th>}
              {threshold > 0 && <th className="text-right py-3 px-4 font-medium">Goal</th>}
              <th className="text-left py-3 px-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {pagedScores.map((s, i) => (
              <tr
                key={s.played_at + i}
                className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${isAbove(s, threshold) ? 'text-violet-400' : ''}`}
              >
                <td className="py-3 px-4 text-white/30">{totalCount - firstItem - i + 1}</td>
                <td className="py-3 px-4 font-medium">{s.score.toLocaleString()}</td>
                {threshold > 0 && (
                  <td className="py-3 px-2 text-center text-base leading-none">
                    {isAbove(s, threshold)
                      ? <span className="text-emerald-400">✓</span>
                      : <span className="text-white/20">✗</span>}
                  </td>
                )}
                {threshold > 0 && (
                  <td className="py-3 px-4 text-right tabular-nums">
                    {s.threshold_at_play != null
                      ? <span className="text-white/40">{s.threshold_at_play.toLocaleString()}</span>
                      : <span className="text-white/15">—</span>}
                  </td>
                )}
                <td className="py-3 px-4 text-white/40">{format(new Date(s.played_at), 'dd/MM/yyyy HH:mm')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
          <span className="text-white/30 text-xs">{firstItem}–{lastItem} of {totalCount}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 text-xs text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >Prev</button>
            <span className="text-white/30 text-xs px-1">{page} / {totalPages}</span>
            <button
              onClick={() => loadPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 text-xs text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >Next</button>
          </div>
        </div>
      )}
    </>
  );
}

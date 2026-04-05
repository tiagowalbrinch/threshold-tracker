import { useMemo } from 'react';
import { PlayAttempt } from '../models/score';

interface Props {
  threshold: number;
  personalBest: number;
  latestScore: number;
  scores: PlayAttempt[];
}

export function ThresholdIndicator({ threshold, personalBest, latestScore, scores }: Props) {
  const max = Math.max(threshold, personalBest, latestScore) * 1.15;
  const thresholdPct = max ? (threshold / max) * 100 : 0;
  const pbPct = max ? (personalBest / max) * 100 : 0;
  const latestPct = max ? (latestScore / max) * 100 : 0;
  const aboveThreshold = !!threshold && latestScore >= threshold;
  const gapToThreshold = threshold && latestScore ? threshold - latestScore : 0;

  const { trendDelta, trendDirection } = useMemo(() => {
    if (scores.length < 2) return { trendDelta: 0, trendDirection: 'stable' as const };
    const recent = scores.slice(-5);
    const prior = scores.slice(-10, -5);
    if (prior.length === 0) return { trendDelta: 0, trendDirection: 'stable' as const };
    const avgRecent = recent.reduce((s, p) => s + p.score, 0) / recent.length;
    const avgPrior = prior.reduce((s, p) => s + p.score, 0) / prior.length;
    const delta = Math.round(avgRecent - avgPrior);
    const dir = Math.abs(delta) < 10 ? 'stable' : delta > 0 ? 'up' : 'down';
    return { trendDelta: delta, trendDirection: dir as 'up' | 'down' | 'stable' };
  }, [scores]);

  if (!threshold) {
    return (
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
        <div className="text-center py-2">
          <p className="text-white/30 text-sm">No threshold set for this task.</p>
          <p className="text-white/20 text-xs mt-1">Set a threshold in the settings below to track your progress.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-5">
      {/* Title */}
      <h3 className="text-white/40 text-xs font-medium uppercase tracking-wider">Last Play</h3>
      {/* Status badge */}
      <div className="flex items-center justify-between">
        {aboveThreshold ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            ABOVE GOAL
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            BELOW GOAL
          </span>
        )}
        {latestScore > 0 && (
          <span className={`text-2xl font-bold ${aboveThreshold ? 'text-emerald-400' : 'text-rose-400'}`}>
            {latestScore.toLocaleString()}
          </span>
        )}
      </div>

      {/* Gap message */}
      {latestScore > 0 && (
        <p className={`text-sm ${aboveThreshold ? 'text-emerald-400/70' : 'text-white/40'}`}>
          {aboveThreshold
            ? `${(-gapToThreshold).toLocaleString()} points above goal`
            : `${gapToThreshold.toLocaleString()} points to reach goal`}
        </p>
      )}

      {/* Progress bar */}
      <div className="relative h-5 bg-white/5 rounded-full overflow-visible">
        {personalBest > 0 && (
          <div className="absolute -top-1 bottom-0 w-0.5 bg-amber-400/60 z-20" style={{ left: `${pbPct}%` }} />
        )}
        <div className="absolute -top-1 bottom-0 w-0.5 bg-cyan-400 z-10" style={{ left: `${thresholdPct}%` }} />
        {latestScore > 0 && (
          <div
            className={`h-full rounded-full transition-all duration-700 ${aboveThreshold ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-violet-700 to-violet-500'}`}
            style={{ width: `${latestPct}%` }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-white/40">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-0.5 bg-cyan-400" />
          <span>Goal: {threshold.toLocaleString()}</span>
        </div>
        {personalBest > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-0.5 bg-amber-400/60" />
            <span>PB: {personalBest.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Trend pill */}
      {scores.length >= 2 && (
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-xs">Last 5 sessions:</span>
          {trendDirection === 'up' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
              ↑ +{trendDelta}
            </span>
          )}
          {trendDirection === 'down' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/15">
              ↓ {trendDelta}
            </span>
          )}
          {trendDirection === 'stable' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-white/30 border border-white/10">
              — stable
            </span>
          )}
        </div>
      )}
    </div>
  );
}

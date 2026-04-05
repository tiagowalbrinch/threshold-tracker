import { PlayAttempt } from '../models/score';

const RECENT_N = 20;

export function calculateThreshold(scores: PlayAttempt[]): number | null {
  if (scores.length < 5) return null;
  const recent = scores.slice(-RECENT_N);
  const sorted = recent.map(s => s.score).sort((a, b) => a - b);
  const trimCount = Math.max(1, Math.floor(sorted.length * 0.2));
  const trimmed = sorted.slice(0, sorted.length - trimCount);
  const idx = Math.floor((trimmed.length - 1) * 0.9);
  return Math.round(trimmed[idx]);
}

export function shouldRecalculateToday(lastCalculatedAt?: string): boolean {
  if (!lastCalculatedAt) return true;
  return new Date(lastCalculatedAt).toDateString() !== new Date().toDateString();
}

export function suggestedWindowSize(scores: PlayAttempt[]): number {
  return Math.min(scores.length, RECENT_N);
}

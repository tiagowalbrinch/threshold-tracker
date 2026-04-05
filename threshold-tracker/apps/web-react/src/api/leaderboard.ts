import { apiRequest } from './client';
import { LeaderboardEntry } from '../models/task';

export function getLeaderboard(taskId: string, from?: string, to?: string) {
  return apiRequest<LeaderboardEntry[]>('/leaderboard', {
    params: { task_id: taskId, from, to },
  });
}

import { apiRequest } from './client';
import { PlayAttempt } from '../models/score';

export function getScores(taskId: string, from?: string, to?: string) {
  return apiRequest<PlayAttempt[]>('/scores', {
    params: { task_id: taskId, from, to },
  });
}

import { apiRequest } from './client';
import { UserTaskStat } from '../models/task';

export function syncAll() {
  return apiRequest<UserTaskStat[]>('/sync', { method: 'POST', body: {} });
}

export function syncTask(taskId: string) {
  return apiRequest<UserTaskStat>(`/sync/task/${encodeURIComponent(taskId)}`, {
    method: 'POST',
  });
}

export function syncPlays(taskId: string) {
  return apiRequest<{ synced: number }>('/sync/plays', {
    method: 'POST',
    params: { task_id: taskId },
  });
}

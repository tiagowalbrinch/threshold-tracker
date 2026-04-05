import { apiRequest } from './client';
import { UserTaskStat, MyTasksParams } from '../models/task';

export function getTasks(params?: MyTasksParams) {
  return apiRequest<UserTaskStat[]>('/tasks', { params: params as Record<string, string | undefined> });
}

export function getTask(id: string) {
  return apiRequest<UserTaskStat>(`/tasks/${encodeURIComponent(id)}`);
}

export function setTaskThreshold(taskId: string, value: number, autosyncEnabled: boolean) {
  return apiRequest<UserTaskStat>(`/tasks/${encodeURIComponent(taskId)}/threshold`, {
    method: 'PATCH',
    body: { value, autosync_enabled: autosyncEnabled },
  });
}

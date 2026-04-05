import { apiRequest } from './client';
import { TaskCatalogItem, CatalogParams } from '../models/task';
import { PagedResponse } from '../models/score';

export function getCatalog(params?: CatalogParams) {
  return apiRequest<PagedResponse<TaskCatalogItem>>('/catalog', {
    params: params as Record<string, string | number | undefined>,
  });
}

export function getCatalogItem(taskId: string) {
  return apiRequest<TaskCatalogItem>(`/catalog/${encodeURIComponent(taskId)}`);
}

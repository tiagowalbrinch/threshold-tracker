import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserTaskStat, TaskCatalogItem, CatalogParams, MyTasksParams } from '../models/task.model';
import { PagedResponse } from '../models/score.model';
import { TaskService } from './task.service';
import { environment } from '../../environments/environment';

@Injectable()
export class HttpTaskService extends TaskService {
  private http = inject(HttpClient);

  getAll(params?: MyTasksParams): Observable<UserTaskStat[]> {
    let httpParams = new HttpParams();
    if (params?.name) httpParams = httpParams.set('name', params.name);
    if (params?.category && params.category !== 'all') httpParams = httpParams.set('category', params.category);
    if (params?.order_by) httpParams = httpParams.set('order_by', params.order_by);
    if (params?.played_from) httpParams = httpParams.set('played_from', params.played_from);
    if (params?.played_to) httpParams = httpParams.set('played_to', params.played_to);
    return this.http.get<UserTaskStat[]>(`${environment.apiUrl}/tasks`, { params: httpParams });
  }

  getById(id: string): Observable<UserTaskStat> {
    return this.http.get<UserTaskStat>(`${environment.apiUrl}/tasks/${encodeURIComponent(id)}`);
  }

  setThreshold(taskId: string, value: number): Observable<UserTaskStat> {
    return this.http.patch<UserTaskStat>(
      `${environment.apiUrl}/tasks/${encodeURIComponent(taskId)}/threshold`,
      { value }
    );
  }

  getCatalog(params?: CatalogParams): Observable<PagedResponse<TaskCatalogItem>> {
    let httpParams = new HttpParams();
    if (params?.name) httpParams = httpParams.set('name', params.name);
    if (params?.category && params.category !== 'all') httpParams = httpParams.set('category', params.category);
    if (params?.order_by) httpParams = httpParams.set('order_by', params.order_by);
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.page_size) httpParams = httpParams.set('page_size', params.page_size);
    return this.http.get<PagedResponse<TaskCatalogItem>>(`${environment.apiUrl}/catalog`, { params: httpParams });
  }
}

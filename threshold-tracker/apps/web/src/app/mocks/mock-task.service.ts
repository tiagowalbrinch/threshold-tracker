import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserTaskStat, TaskCatalogItem, CatalogParams, MyTasksParams } from '../models/task.model';
import { PagedResponse } from '../models/score.model';
import { TaskService } from '../services/task.service';

@Injectable()
export class MockTaskService extends TaskService {
  getAll(_params?: MyTasksParams): Observable<UserTaskStat[]> { return of([]); }
  getById(_id: string): Observable<UserTaskStat> { return of({} as UserTaskStat); }
  setThreshold(_taskId: string, _value: number, _autosyncEnabled?: boolean): Observable<UserTaskStat> { return of({} as UserTaskStat); }
  getCatalog(_params?: CatalogParams): Observable<PagedResponse<TaskCatalogItem>> {
    return of({ items: [], total_count: 0, page: 1, page_size: 24 });
  }
  getCatalogItem(_taskId: string): Observable<TaskCatalogItem> { return of({} as TaskCatalogItem); }
}

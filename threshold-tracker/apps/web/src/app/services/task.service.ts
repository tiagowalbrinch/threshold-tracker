import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserTaskStat, TaskCatalogItem, CatalogParams, MyTasksParams } from '../models/task.model';
import { PagedResponse } from '../models/score.model';

@Injectable()
export abstract class TaskService {
  abstract getAll(params?: MyTasksParams): Observable<UserTaskStat[]>;
  abstract getById(id: string): Observable<UserTaskStat>;
  abstract setThreshold(taskId: string, value: number, autosyncEnabled?: boolean): Observable<UserTaskStat>;
  abstract getCatalog(params?: CatalogParams): Observable<PagedResponse<TaskCatalogItem>>;
  abstract getCatalogItem(taskId: string): Observable<TaskCatalogItem>;
}

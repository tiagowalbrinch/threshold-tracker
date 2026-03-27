import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserTaskStat, TaskCatalogItem, CatalogParams, MyTasksParams } from '../models/task.model';
import { PagedResponse } from '../models/score.model';

@Injectable()
export abstract class TaskService {
  abstract getAll(params?: MyTasksParams): Observable<UserTaskStat[]>;
  abstract getById(id: string): Observable<UserTaskStat>;
  abstract setThreshold(taskId: string, value: number): Observable<UserTaskStat>;
  abstract getCatalog(params?: CatalogParams): Observable<PagedResponse<TaskCatalogItem>>;
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable()
export abstract class TaskService {
  abstract getAll(): Observable<Task[]>;
  abstract getById(id: string): Observable<Task>;
  abstract create(task: Partial<Task>): Observable<Task>;
  abstract update(id: string, data: Partial<Task>): Observable<Task>;
  abstract delete(id: string): Observable<void>;
}

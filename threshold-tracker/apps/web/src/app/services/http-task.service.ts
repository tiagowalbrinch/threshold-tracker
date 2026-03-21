import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Task, PagedResponse } from '../models/task.model';
import { TaskService } from './task.service';
import { environment } from '../../environments/environment';

@Injectable()
export class HttpTaskService extends TaskService {
  private http = inject(HttpClient);

  getAll(): Observable<Task[]> {
    return this.http.get<PagedResponse<Task>>(`${environment.apiUrl}/tasks?page=1&pageSize=100`).pipe(
      map(r => r.items)
    );
  }

  getPaged(page: number, pageSize: number): Observable<PagedResponse<Task>> {
    return this.http.get<PagedResponse<Task>>(`${environment.apiUrl}/tasks?page=${page}&pageSize=${pageSize}`);
  }

  getById(id: string): Observable<Task> {
    return this.http.get<Task>(`${environment.apiUrl}/tasks/${id}`);
  }

  create(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(`${environment.apiUrl}/tasks`, task);
  }

  update(id: string, data: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${environment.apiUrl}/tasks/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/tasks/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';
import { TaskService } from './task.service';

const API_BASE = 'https://your-backend.com/api';

@Injectable()
export class HttpTaskService extends TaskService {
  constructor(private http: HttpClient) { super(); }

  getAll(): Observable<Task[]> {
    return this.http.get<Task[]>(`${API_BASE}/tasks`);
  }
  getById(id: string): Observable<Task> {
    return this.http.get<Task>(`${API_BASE}/tasks/${id}`);
  }
  create(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(`${API_BASE}/tasks`, task);
  }
  update(id: string, data: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${API_BASE}/tasks/${id}`, data);
  }
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/tasks/${id}`);
  }
}

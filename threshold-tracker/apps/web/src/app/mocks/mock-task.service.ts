import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Task } from '../models/task.model';
import { TaskService } from '../services/task.service';
import { MOCK_TASKS } from './mock-data';

@Injectable()
export class MockTaskService extends TaskService {
  private tasks: Task[] = [...MOCK_TASKS];

  getAll(): Observable<Task[]> {
    console.log('MockTaskService: fetching all tasks');
    return of([...this.tasks]).pipe();
  }

  getById(id: string): Observable<Task> {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return throwError(() => new Error(`Task ${id} not found`));
    return of({ ...task }).pipe(delay(200));
  }

  create(data: Partial<Task>): Observable<Task> {
    const newTask: Task = {
      id: String(Date.now()),
      name: data.name || 'Nova Task',
      category: data.category || 'other',
      threshold: data.threshold,
      personal_best: data.personal_best,
      notes: data.notes,
      created_date: new Date().toISOString(),
    };
    this.tasks = [newTask, ...this.tasks];
    return of({ ...newTask }).pipe(delay(300));
  }

  update(id: string, data: Partial<Task>): Observable<Task> {
    this.tasks = this.tasks.map(t => t.id === id ? { ...t, ...data } : t);
    const updated = this.tasks.find(t => t.id === id)!;
    return of({ ...updated }).pipe(delay(200));
  }

  delete(id: string): Observable<void> {
    this.tasks = this.tasks.filter(t => t.id !== id);
    return of(undefined).pipe(delay(200));
  }
}

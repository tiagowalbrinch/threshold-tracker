import { Injectable } from '@angular/core';
import { Task } from '../../models/task.model';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks: Task[] = [
    {
      id: 1,
      name: 'task teste 1',
      type: 'Clicking',
      threshold: null,
      pb: 5000,
      attempts: 1
    },
    {
      id: 2,
      name: 'Gridshot',
      type: 'Clicking',
      threshold: 82000,
      pb: 91500,
      attempts: 7
    },
    {
      id: 3,
      name: 'Sixshot',
      type: 'Flicking',
      threshold: 105000,
      pb: 118000,
      attempts: 4
    },
    {
      id: 4,
      name: 'Motionshot',
      type: 'Tracking',
      threshold: null,
      pb: 72000,
      attempts: 3
    }
  ];

  getTasks(): Observable<Task[]> {
    return of(this.tasks);
  }
}
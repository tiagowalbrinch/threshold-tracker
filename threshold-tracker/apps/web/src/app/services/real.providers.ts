import { Provider } from '@angular/core';
import { TaskService } from './task.service';
import { ScoreService } from './score.service';
import { HttpTaskService } from './http-task.service';
import { HttpScoreService } from './http-score.service';

// Switch app.config.ts to use these when your backend is ready
export const realProviders: Provider[] = [
  { provide: TaskService, useClass: HttpTaskService },
  { provide: ScoreService, useClass: HttpScoreService },
];

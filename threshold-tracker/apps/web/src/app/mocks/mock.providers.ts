import { Provider } from '@angular/core';
import { TaskService } from '../services/task.service';
import { ScoreService } from '../services/score.service';
import { MockTaskService } from './mock-task.service';
import { MockScoreService } from './mock-score.service';

export const mockProviders: Provider[] = [
  { provide: TaskService, useClass: MockTaskService },
  { provide: ScoreService, useClass: MockScoreService },
];

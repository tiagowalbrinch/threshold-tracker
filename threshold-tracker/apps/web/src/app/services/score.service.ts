import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PlayAttempt, PagedResponse } from '../models/score.model';

@Injectable()
export abstract class ScoreService {
  abstract getByTask(taskId: string, from?: string, to?: string): Observable<PlayAttempt[]>;
}

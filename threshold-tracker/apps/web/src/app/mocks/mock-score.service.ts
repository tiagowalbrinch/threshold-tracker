import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PlayAttempt } from '../models/score.model';
import { ScoreService } from '../services/score.service';

@Injectable()
export class MockScoreService extends ScoreService {
  getByTask(taskId: string, from?: string, to?: string): Observable<PlayAttempt[]> { return of([]); }
}

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PlayAttempt, PagedResponse } from '../models/score.model';
import { ScoreService } from '../services/score.service';

@Injectable()
export class MockScoreService extends ScoreService {
  getByTask(taskId: string, from?: string, to?: string): Observable<PlayAttempt[]> { return of([]); }
  getByTaskPaged(taskId: string, page: number, pageSize: number): Observable<PagedResponse<PlayAttempt>> {
    return of({ items: [], total_count: 0, page: 1, page_size: 25 });
  }
}

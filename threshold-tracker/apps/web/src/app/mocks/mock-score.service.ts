import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Score } from '../models/score.model';
import { ScoreService } from '../services/score.service';
import { MOCK_SCORES } from './mock-data';

@Injectable()
export class MockScoreService extends ScoreService {
  private scores: Score[] = [...MOCK_SCORES];

  getByTask(taskId: string): Observable<Score[]> {
    const result = this.scores.filter(s => s.task_id === taskId);
    return of([...result]).pipe(delay(200));
  }

  getAll(): Observable<Score[]> {
    return of([...this.scores]).pipe(delay(300));
  }

  create(data: Partial<Score>): Observable<Score> {
    const newScore: Score = {
      id: String(Date.now()),
      task_id: data.task_id || '',
      value: data.value || 0,
      is_pb: data.is_pb,
      sensitivity: data.sensitivity,
      fov: data.fov,
      dpi: data.dpi,
      notes: data.notes,
      created_date: new Date().toISOString(),
    };
    this.scores = [newScore, ...this.scores];
    return of({ ...newScore }).pipe(delay(300));
  }

  delete(id: string): Observable<void> {
    this.scores = this.scores.filter(s => s.id !== id);
    return of(undefined).pipe(delay(200));
  }
}

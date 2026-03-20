import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Score } from '../models/score.model';

@Injectable()
export abstract class ScoreService {
  abstract getByTask(taskId: string): Observable<Score[]>;
  abstract getAll(): Observable<Score[]>;
  abstract create(score: Partial<Score>): Observable<Score>;
  abstract delete(id: string): Observable<void>;
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Score } from '../models/score.model';
import { ScoreService } from './score.service';

const API_BASE = 'https://your-backend.com/api';

@Injectable()
export class HttpScoreService extends ScoreService {
  constructor(private http: HttpClient) { super(); }

  getByTask(taskId: string): Observable<Score[]> {
    return this.http.get<Score[]>(`${API_BASE}/scores?task_id=${taskId}`);
  }
  getAll(): Observable<Score[]> {
    return this.http.get<Score[]>(`${API_BASE}/scores`);
  }
  create(score: Partial<Score>): Observable<Score> {
    return this.http.post<Score>(`${API_BASE}/scores`, score);
  }
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/scores/${id}`);
  }
}

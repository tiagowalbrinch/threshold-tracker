import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Score } from '../models/score.model';
import { ScoreService } from './score.service';
import { environment } from '../../environments/environment';

@Injectable()
export class HttpScoreService extends ScoreService {
  private http = inject(HttpClient);

  getByTask(taskId: string): Observable<Score[]> {
    return this.http.get<Score[]>(`${environment.apiUrl}/scores?task_id=${taskId}`);
  }

  getByTaskMine(taskId: string): Observable<Score[]> {
    return this.http.get<Score[]>(`${environment.apiUrl}/scores?task_id=${taskId}&mine=true`);
  }

  getAll(): Observable<Score[]> {
    return this.http.get<Score[]>(`${environment.apiUrl}/scores`);
  }

  create(score: Partial<Score>): Observable<Score> {
    return this.http.post<Score>(`${environment.apiUrl}/scores`, score);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/scores/${id}`);
  }
}

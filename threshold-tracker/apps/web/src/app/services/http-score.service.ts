import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlayAttempt } from '../models/score.model';
import { ScoreService } from './score.service';
import { environment } from '../../environments/environment';

@Injectable()
export class HttpScoreService extends ScoreService {
  private http = inject(HttpClient);

  getByTask(taskId: string, from?: string, to?: string): Observable<PlayAttempt[]> {
    let params = new HttpParams().set('task_id', taskId);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<PlayAttempt[]>(`${environment.apiUrl}/scores`, { params });
  }

}

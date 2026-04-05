import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserTaskStat, LeaderboardEntry } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private http = inject(HttpClient);

  sync(): Observable<UserTaskStat[]> {
    return this.http.post<UserTaskStat[]>(`${environment.apiUrl}/sync`, {});
  }

  syncPlays(taskId: string): Observable<{ synced: number }> {
    return this.http.post<{ synced: number }>(
      `${environment.apiUrl}/sync/plays`,
      null,
      { params: { task_id: taskId } }
    );
  }

  syncTask(taskId: string): Observable<UserTaskStat> {
    return this.http.post<UserTaskStat>(
      `${environment.apiUrl}/sync/task/${encodeURIComponent(taskId)}`,
      null
    );
  }

  getLeaderboard(taskId: string, from?: string, to?: string): Observable<LeaderboardEntry[]> {
    let params = new HttpParams().set('task_id', taskId);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<LeaderboardEntry[]>(`${environment.apiUrl}/leaderboard`, { params });
  }
}

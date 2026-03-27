import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  getLeaderboard(taskId: string): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(
      `${environment.apiUrl}/leaderboard?task_id=${encodeURIComponent(taskId)}`
    );
  }
}

import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LeaderboardEntry, UserTaskStat } from '../../models/task.model';
import { SyncService } from '../../services/sync.service';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './leaderboard.component.html',
})
export class LeaderboardComponent {
  private syncService = inject(SyncService);
  private taskService = inject(TaskService);
  authService = inject(AuthService);

  search = signal('');
  taskSuggestions = signal<UserTaskStat[]>([]);
  selectedTask = signal<UserTaskStat | null>(null);
  entries = signal<LeaderboardEntry[]>([]);
  loading = signal(false);
  loadingSuggestions = signal(false);

  onSearchInput(value: string) {
    this.search.set(value);
    if (!value.trim()) { this.taskSuggestions.set([]); return; }
    this.loadingSuggestions.set(true);
    this.taskService.getAll().subscribe({
      next: (tasks) => {
        this.taskSuggestions.set(
          tasks.filter(t => t.task_name.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
        );
        this.loadingSuggestions.set(false);
      },
      error: () => this.loadingSuggestions.set(false)
    });
  }

  selectTask(task: UserTaskStat) {
    this.selectedTask.set(task);
    this.search.set(task.task_name);
    this.taskSuggestions.set([]);
    this.loading.set(true);
    this.syncService.getLeaderboard(task.aimlabs_task_id).subscribe({
      next: (entries) => { this.entries.set(entries); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  formatDate(d: string) { return format(new Date(d), 'dd/MM/yyyy'); }
}

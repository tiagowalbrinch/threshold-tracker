import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserTaskStat, LeaderboardEntry } from '../../models/task.model';
import { PlayAttempt } from '../../models/score.model';
import { TaskService } from '../../services/task.service';
import { ScoreService } from '../../services/score.service';
import { SyncService } from '../../services/sync.service';
import { ThresholdIndicatorComponent } from '../../components/threshold-indicator/threshold-indicator.component';
import { StatsOverviewComponent } from '../../components/stats-overview/stats-overview.component';
import { ScoreChartComponent } from '../../components/score-chart/score-chart.component';
import { ScoreHistoryTableComponent } from '../../components/score-history-table/score-history-table.component';
import { ThresholdSettingsComponent } from '../../components/threshold-settings/threshold-settings.component';
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [
    RouterLink,
    ThresholdIndicatorComponent,
    StatsOverviewComponent,
    ScoreChartComponent,
    ScoreHistoryTableComponent,
    ThresholdSettingsComponent,
  ],
  templateUrl: './task-details.component.html',
})
export class TaskDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private taskService = inject(TaskService);
  private scoreService = inject(ScoreService);
  private syncService = inject(SyncService);
  authService = inject(AuthService);

  task = signal<UserTaskStat | undefined>(undefined);
  scores = signal<PlayAttempt[]>([]);
  loading = signal(true);
  loadingScores = signal(false);
  showSettings = signal(false);

  syncingPlays = signal(false);
  recalculating = signal(false);
  refreshTrigger = signal(0);

  showLeaderboard = signal(false);
  leaderboardEntries = signal<LeaderboardEntry[]>([]);
  loadingLeaderboard = signal(false);

  dateFrom = signal('');
  dateTo = signal('');

  taskId = '';

  latestScore = computed(() => {
    const s = this.scores();
    return s.length > 0 ? s[s.length - 1].score : 0;
  });

  ngOnInit() {
    this.taskId = this.route.snapshot.paramMap.get('id') || '';
    this.loadData();
  }

  private loadData(from?: string, to?: string) {
    forkJoin({
      task: this.taskService.getById(this.taskId),
      scores: this.scoreService.getByTask(this.taskId, from, to)
    }).subscribe({
      next: ({ task, scores }) => {
        this.task.set(task);
        this.scores.set(scores.sort(
          (a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
        ));
        this.loading.set(false);
        // Auto-sync plays if none stored yet
        if (scores.length === 0) {
          this.onSyncPlays();
        }
      },
      error: () => this.loading.set(false)
    });
  }

  onFilterScores() {
    this.loadingScores.set(true);
    this.scoreService.getByTask(this.taskId, this.dateFrom() || undefined, this.dateTo() || undefined)
      .subscribe({
        next: (scores) => {
          this.scores.set(scores.sort(
            (a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
          ));
          this.loadingScores.set(false);
        },
        error: () => this.loadingScores.set(false)
      });
  }

  onSyncPlays() {
    this.syncingPlays.set(true);
    this.syncService.syncPlays(this.taskId).subscribe({
      next: () => {
        this.syncingPlays.set(false);
        // Refresh flat scores for chart/stats and trigger table reload
        this.scoreService.getByTask(this.taskId).subscribe(s => {
          this.scores.set(s.sort(
            (a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
          ));
        });
        this.refreshTrigger.update(v => v + 1);
      },
      error: () => this.syncingPlays.set(false)
    });
  }

  onOpenLeaderboard() {
    this.showLeaderboard.set(true);
    if (this.leaderboardEntries().length > 0) return;
    this.loadingLeaderboard.set(true);
    this.syncService.getLeaderboard(this.taskId).subscribe({
      next: entries => {
        this.leaderboardEntries.set(entries);
        this.loadingLeaderboard.set(false);
      },
      error: () => this.loadingLeaderboard.set(false)
    });
  }

  onRecalculate() {
    this.recalculating.set(true);
    this.syncService.syncTask(this.taskId).subscribe({
      next: (updated) => {
        this.task.set(updated);
        this.recalculating.set(false);
      },
      error: () => this.recalculating.set(false)
    });
  }

  onUpdateThreshold(threshold: number) {
    this.taskService.setThreshold(this.taskId, threshold).subscribe(updated => {
      this.task.update(t => t ? { ...t, threshold_value: updated.threshold_value } : t);
      this.showSettings.set(false);
    });
  }
}

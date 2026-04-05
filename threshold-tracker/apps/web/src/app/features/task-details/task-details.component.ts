import { Component, OnInit, signal, computed, inject, DestroyRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { DateRangeSelectComponent, dateRangeToParams } from '../../components/date-range-select/date-range-select.component';
import { AuthService } from '../../services/auth.service';
import { forkJoin, interval } from 'rxjs';

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
    DateRangeSelectComponent,
  ],
  templateUrl: './task-details.component.html',
})
export class TaskDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private taskService = inject(TaskService);
  private scoreService = inject(ScoreService);
  private syncService = inject(SyncService);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);
  authService = inject(AuthService);

  task = signal<UserTaskStat | undefined>(undefined);
  scores = signal<PlayAttempt[]>([]);
  loading = signal(true);
  recalculating = signal(false);

  showLeaderboard = signal(false);
  leaderboardEntries = signal<LeaderboardEntry[]>([]);
  loadingLeaderboard = signal(false);

  dateRange = signal('all');

  taskId = '';

  latestScore = computed(() => {
    const s = this.scores();
    return s.length > 0 ? s[s.length - 1].score : 0;
  });

  chartScores = computed(() => {
    const { from, to } = dateRangeToParams(this.dateRange());
    if (!from && !to) return this.scores();
    return this.scores().filter(s => {
      const t = new Date(s.played_at).getTime();
      if (from && t < new Date(from).getTime()) return false;
      if (to && t > new Date(to + 'T23:59:59').getTime()) return false;
      return true;
    });
  });

  ngOnInit() {
    this.taskId = this.route.snapshot.paramMap.get('id') || '';
    this.loadData();

    if (isPlatformBrowser(this.platformId)) {
      interval(60_000)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.loadScores());
    }
  }

  private loadData() {
    forkJoin({
      task: this.taskService.getById(this.taskId),
      scores: this.scoreService.getByTask(this.taskId)
    }).subscribe({
      next: ({ task, scores }) => {
        this.task.set(task);
        const sorted = scores.sort(
          (a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
        );
        this.scores.set(sorted);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private loadScores() {
    this.scoreService.getByTask(this.taskId).subscribe({
      next: scores => {
        const sorted = scores.sort(
          (a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
        );
        const current = this.scores();
        const hasNew = sorted.length !== current.length ||
          sorted.at(-1)?.played_at !== current.at(-1)?.played_at;
        if (hasNew) this.scores.set(sorted);
      }
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

  onUpdateThreshold(event: { value: number; autosyncEnabled: boolean }) {
    this.taskService.setThreshold(this.taskId, event.value, event.autosyncEnabled).subscribe(updated => {
      this.task.update(t => t ? {
        ...t,
        threshold_value: updated.threshold_value,
        autosync_enabled: updated.autosync_enabled,
        last_calculated_at: updated.last_calculated_at
      } : t);
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
}

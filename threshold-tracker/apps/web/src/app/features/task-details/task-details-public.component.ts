import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LeaderboardEntry, TaskCatalogItem } from '../../models/task.model';
import { SyncService } from '../../services/sync.service';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';

type DateRangeKey = 'all' | 'last_7_days' | 'last_30_days' | 'last_3_months';

const DATE_RANGE_OPTIONS: { value: DateRangeKey; label: string }[] = [
  { value: 'all',          label: 'All time' },
  { value: 'last_7_days',  label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last month' },
  { value: 'last_3_months',label: 'Last 3 months' },
];

@Component({
  selector: 'app-task-details-public',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './task-details-public.component.html',
})
export class TaskDetailsPublicComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private syncService = inject(SyncService);
  private taskService = inject(TaskService);
  authService = inject(AuthService);

  taskId = '';
  taskInfo = signal<TaskCatalogItem | undefined>(undefined);
  entries = signal<LeaderboardEntry[]>([]);
  loading = signal(true);

  dateRange = signal<DateRangeKey>('all');
  sortByImproving = signal(false);

  readonly dateRangeOptions = DATE_RANGE_OPTIONS;

  sortedEntries = computed(() => {
    const list = [...this.entries()];
    if (this.sortByImproving()) {
      return list.sort((a, b) => (b.trend_delta ?? -Infinity) - (a.trend_delta ?? -Infinity));
    }
    return list;
  });

  ngOnInit() {
    this.taskId = this.route.snapshot.paramMap.get('id') || '';
    this.taskService.getCatalogItem(this.taskId).subscribe({
      next: info => this.taskInfo.set(info),
      error: () => {}
    });
    this.loadLeaderboard();
  }

  onDateRangeChange(value: DateRangeKey) {
    this.dateRange.set(value);
    this.loadLeaderboard();
  }

  onClickEntry() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/task', this.taskId]);
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/task/${this.taskId}` } });
    }
  }

  private loadLeaderboard() {
    this.loading.set(true);
    const { from, to } = this.dateRangeToParams();
    this.syncService.getLeaderboard(this.taskId, from, to).subscribe({
      next: entries => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private dateRangeToParams(): { from?: string; to?: string } {
    const now = new Date();
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const daysAgo = (n: number) => { const d = new Date(now); d.setDate(d.getDate() - n); d.setHours(0,0,0,0); return d; };
    const monthsAgo = (n: number) => { const d = new Date(now); d.setMonth(d.getMonth() - n); d.setHours(0,0,0,0); return d; };

    switch (this.dateRange()) {
      case 'last_7_days':   return { from: fmt(daysAgo(7)) };
      case 'last_30_days':  return { from: fmt(daysAgo(30)) };
      case 'last_3_months': return { from: fmt(monthsAgo(3)) };
      default:              return {};
    }
  }

  trendLabel(delta?: number): string {
    if (delta == null) return '';
    if (Math.abs(delta) < 10) return '→';
    return delta > 0 ? '↑' : '↓';
  }

  trendClass(delta?: number): string {
    if (delta == null || Math.abs(delta) < 10) return 'text-white/30';
    return delta > 0 ? 'text-emerald-400' : 'text-rose-400';
  }

  absTrendDelta(delta: number): number {
    return Math.abs(delta);
  }
}

import { Component, Input, OnChanges, SimpleChanges, signal, computed, inject } from '@angular/core';
import { PlayAttempt } from '../../models/score.model';
import { ScoreService } from '../../services/score.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-score-history-table',
  standalone: true,
  imports: [],
  templateUrl: './score-history-table.component.html',
})
export class ScoreHistoryTableComponent implements OnChanges {
  private scoreService = inject(ScoreService);

  @Input() taskId = '';
  @Input() threshold = 0;
  @Input() refreshTrigger = 0;

  readonly pageSize = 25;

  page = signal(1);
  totalCount = signal(0);
  pagedScores = signal<PlayAttempt[]>([]);
  loading = signal(false);

  totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize)));

  firstItem = computed(() => (this.page() - 1) * this.pageSize + 1);
  lastItem = computed(() => Math.min(this.page() * this.pageSize, this.totalCount()));

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['taskId'] || changes['refreshTrigger']) && this.taskId) {
      this.loadPage(1);
    }
  }

  loadPage(p: number) {
    this.page.set(p);
    this.loading.set(true);
    this.scoreService.getByTaskPaged(this.taskId, p, this.pageSize).subscribe({
      next: r => {
        this.pagedScores.set(r.items);
        this.totalCount.set(r.total_count);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  formatDate(d: string) { return format(new Date(d), 'dd/MM/yyyy HH:mm'); }
}

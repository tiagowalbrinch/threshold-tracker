import { Component, Input, signal, computed } from '@angular/core';
import { PlayAttempt } from '../../models/score.model';
import { format } from 'date-fns';

@Component({
  selector: 'app-score-history-table',
  standalone: true,
  imports: [],
  templateUrl: './score-history-table.component.html',
})
export class ScoreHistoryTableComponent {
  @Input() set scores(value: PlayAttempt[]) { this._scores.set(value); this.page.set(1); }
  @Input() threshold = 0;

  private _scores = signal<PlayAttempt[]>([]);

  readonly pageSize = 25;
  page = signal(1);

  totalCount = computed(() => this._scores().length);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize)));
  firstItem = computed(() => (this.page() - 1) * this.pageSize + 1);
  lastItem = computed(() => Math.min(this.page() * this.pageSize, this.totalCount()));

  // Scores are sorted oldest→newest; table shows newest first
  pagedScores = computed(() => {
    const all = [...this._scores()].reverse();
    const start = (this.page() - 1) * this.pageSize;
    return all.slice(start, start + this.pageSize);
  });

  loadPage(p: number) {
    this.page.set(Math.max(1, Math.min(p, this.totalPages())));
  }

  formatDate(d: string) { return format(new Date(d), 'dd/MM/yyyy HH:mm'); }
}

import { Component, Input } from '@angular/core';
import { Score } from '../../models/score.model';

@Component({
  selector: 'app-stats-overview',
  standalone: true,
  imports: [],
  templateUrl: './stats-overview.component.html',
})
export class StatsOverviewComponent {
  @Input() scores: Score[] = [];
  @Input() threshold = 0;
  @Input() personalBest = 0;

  get totalAttempts() { return this.scores.length; }

  get avgScore() {
    if (!this.scores.length) return 0;
    return Math.round(this.scores.reduce((s, sc) => s + sc.value, 0) / this.scores.length);
  }

  get consistencyPct(): number | null {
    if (!this.threshold || !this.scores.length) return null;
    const above = this.scores.filter(s => s.value >= this.threshold).length;
    return Math.round((above / this.scores.length) * 100);
  }
}

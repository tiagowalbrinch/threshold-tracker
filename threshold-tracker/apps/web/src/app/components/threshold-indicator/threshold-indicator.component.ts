import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { PlayAttempt } from '../../models/score.model';

@Component({
  selector: 'app-threshold-indicator',
  standalone: true,
  imports: [NgClass],
  templateUrl: './threshold-indicator.component.html',
})
export class ThresholdIndicatorComponent {
  @Input() threshold = 0;
  @Input() personalBest = 0;
  @Input() latestScore = 0;
  @Input() scores: PlayAttempt[] = [];

  get max(): number {
    return Math.max(this.threshold, this.personalBest, this.latestScore) * 1.15;
  }
  get thresholdPct(): number { return this.max ? (this.threshold / this.max) * 100 : 0; }
  get pbPct(): number { return this.max ? (this.personalBest / this.max) * 100 : 0; }
  get latestPct(): number { return this.max ? (this.latestScore / this.max) * 100 : 0; }
  get aboveThreshold(): boolean { return !!this.threshold && this.latestScore >= this.threshold; }

  get gapToThreshold(): number {
    if (!this.threshold || !this.latestScore) return 0;
    return this.threshold - this.latestScore;
  }

  get trendDelta(): number {
    if (this.scores.length < 2) return 0;
    const recent = this.scores.slice(-5);
    const prior = this.scores.slice(-10, -5);
    if (prior.length === 0) return 0;
    const avgRecent = recent.reduce((s, p) => s + p.score, 0) / recent.length;
    const avgPrior = prior.reduce((s, p) => s + p.score, 0) / prior.length;
    return Math.round(avgRecent - avgPrior);
  }

  get trendDirection(): 'up' | 'down' | 'stable' {
    if (Math.abs(this.trendDelta) < 10) return 'stable';
    return this.trendDelta > 0 ? 'up' : 'down';
  }
}

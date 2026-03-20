import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

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

  get max(): number {
    return Math.max(this.threshold, this.personalBest, this.latestScore) * 1.15;
  }
  get thresholdPct(): number { return this.max ? (this.threshold / this.max) * 100 : 0; }
  get latestPct(): number { return this.max ? (this.latestScore / this.max) * 100 : 0; }
  get aboveThreshold(): boolean { return !!this.threshold && this.latestScore >= this.threshold; }
}

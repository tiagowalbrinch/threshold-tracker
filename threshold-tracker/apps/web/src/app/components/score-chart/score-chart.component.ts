import { Component, Input, OnChanges, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { PlayAttempt } from '../../models/score.model';

@Component({
  selector: 'app-score-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './score-chart.component.html',
})
export class ScoreChartComponent implements OnChanges {
  @Input() scores: PlayAttempt[] = [];
  @Input() threshold = 0;

  private platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  chartData: any[] = [];
  chartLabels: string[] = [];

  chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ctx.raw?.toLocaleString?.() ?? ctx.raw
        }
      }
    },
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.2)' }, grid: { display: false } },
      y: { ticks: { color: 'rgba(255,255,255,0.2)' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  ngOnChanges() {
    const sorted = [...this.scores].sort(
      (a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
    );
    this.chartLabels = sorted.map((_, i) => String(i + 1));

    const datasets: any[] = [{
      data: sorted.map(s => s.score),
      fill: true,
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139,92,246,0.15)',
      tension: 0.3,
      pointBackgroundColor: '#8b5cf6',
      pointRadius: 4,
    }];

    if (this.threshold > 0) {
      datasets.push({
        data: sorted.map(() => this.threshold),
        borderColor: '#22d3ee',
        borderWidth: 1.5,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
        tension: 0,
      });
    }

    this.chartData = datasets;
  }
}

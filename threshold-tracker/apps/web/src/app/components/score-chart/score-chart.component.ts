import { Component, Input, OnChanges, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Score } from '../../models/score.model';

@Component({
  selector: 'app-score-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './score-chart.component.html',
})
export class ScoreChartComponent implements OnChanges {
  @Input() scores: Score[] = [];
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
          label: (ctx: any) => ctx.raw.toLocaleString()
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
      (a, b) => new Date(a.created_date!).getTime() - new Date(b.created_date!).getTime()
    );
    this.chartLabels = sorted.map((_, i) => String(i + 1));
    this.chartData = [{
      data: sorted.map(s => s.value),
      fill: true,
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139,92,246,0.15)',
      tension: 0.3,
      pointBackgroundColor: sorted.map(s => s.is_pb ? '#f59e0b' : '#8b5cf6'),
      pointRadius: sorted.map(s => s.is_pb ? 6 : 4),
    }];
  }
}

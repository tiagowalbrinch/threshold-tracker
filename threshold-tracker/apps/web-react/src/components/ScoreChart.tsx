import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler,
  ChartData,
} from 'chart.js';
import { PlayAttempt } from '../models/score';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface Props {
  scores: PlayAttempt[];
  threshold: number;
}

const OPTIONS = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: { raw: unknown }) =>
          typeof ctx.raw === 'number' ? ctx.raw.toLocaleString() : String(ctx.raw),
      },
    },
  },
  scales: {
    x: { ticks: { color: 'rgba(255,255,255,0.2)' }, grid: { display: false } },
    y: { ticks: { color: 'rgba(255,255,255,0.2)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
  },
};

export function ScoreChart({ scores, threshold }: Props) {
  const chartData = useMemo((): ChartData<'line'> => {
    const sorted = [...scores].sort((a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime());
    const labels = sorted.map((_, i) => String(i + 1));
    const datasets: ChartData<'line'>['datasets'] = [
      {
        data: sorted.map(s => s.score),
        fill: true,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.15)',
        tension: 0.3,
        pointBackgroundColor: '#8b5cf6',
        pointRadius: 4,
      },
    ];
    if (threshold > 0) {
      datasets.push({
        data: sorted.map(() => threshold),
        borderColor: '#22d3ee',
        borderWidth: 1.5,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
        tension: 0,
      });
    }
    return { labels, datasets };
  }, [scores, threshold]);

  if (scores.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-white/20 text-sm">
        No scores yet
      </div>
    );
  }

  return <Line data={chartData} options={OPTIONS} />;
}

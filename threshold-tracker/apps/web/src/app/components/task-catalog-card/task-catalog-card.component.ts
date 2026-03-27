import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { TaskCatalogItem } from '../../models/task.model';

@Component({
  selector: 'app-task-catalog-card',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './task-catalog-card.component.html',
})
export class TaskCatalogCardComponent {
  @Input() task!: TaskCatalogItem;

  get colorClass(): string {
    const map: Record<string, string> = {
      tracking: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
      flicking: 'from-violet-500/20 to-violet-500/5 border-violet-500/30',
      switching: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
      clicking: 'from-rose-500/20 to-rose-500/5 border-rose-500/30',
      other: 'from-slate-500/20 to-slate-500/5 border-slate-500/30',
    };
    return map[this.task.category] || map['other'];
  }

  get textColor(): string {
    const map: Record<string, string> = {
      tracking: 'text-cyan-400', flicking: 'text-violet-400',
      switching: 'text-amber-400', clicking: 'text-rose-400', other: 'text-slate-400',
    };
    return map[this.task.category] || 'text-slate-400';
  }

  get avgScoreDisplay(): string {
    return this.task.avg_score != null ? Math.round(this.task.avg_score).toLocaleString() : '—';
  }
}

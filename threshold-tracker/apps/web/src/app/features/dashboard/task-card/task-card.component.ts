import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Task } from '../../../models/task.model';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-task-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule, TagModule, ProgressBarModule, ButtonModule, RouterLink, DecimalPipe],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss'
})
export class TaskCardComponent {
  task = input.required<Task>();

  progress = computed(() => {
    const { threshold, pb } = this.task();
    if (!threshold) return null;
    return Math.min(100, Math.round((pb / threshold) * 100));
  });

  typeSeverity = computed((): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' => {
    switch (this.task().type) {
      case 'Clicking':  return 'danger';
      case 'Flicking':  return 'info';
      case 'Tracking':  return 'success';
      case 'Switching': return 'warn';
      default:          return 'secondary';
    }
  });
}

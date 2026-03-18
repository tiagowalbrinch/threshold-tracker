import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { map } from 'rxjs';
import { TaskService } from '../../core/services/task.service';
import { HeaderComponent } from '../../core/components/header/header.component';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-task-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, CardModule, TagModule, ButtonModule, RouterLink, DecimalPipe],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.scss'
})
export class TaskDetailsComponent {
  private route = inject(ActivatedRoute);
  private taskService = inject(TaskService);

  private taskId = toSignal(this.route.params.pipe(map(p => Number(p['id']))));
  private allTasks = toSignal(this.taskService.getTasks(), { initialValue: [] });

  task = computed(() => {
    const id = this.taskId();
    return this.allTasks().find(t => t.id === id) ?? null;
  });

  typeSeverity = computed((): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' => {
    switch (this.task()?.type) {
      case 'Clicking':  return 'danger';
      case 'Flicking':  return 'info';
      case 'Tracking':  return 'success';
      case 'Switching': return 'warn';
      default:          return 'secondary';
    }
  });
}

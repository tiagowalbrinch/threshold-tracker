import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TaskService } from '../../core/services/task.service';
import { TaskCardComponent } from './task-card/task-card.component';
import { TaskFilterComponent } from './task-filter/task-filter.component';
import { TaskSearchComponent } from './task-search/task-search.component';
import { HeaderComponent } from '../../core/components/header/header.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TaskCardComponent, TaskFilterComponent, TaskSearchComponent, HeaderComponent, ButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private taskService = inject(TaskService);
  private allTasks = toSignal(this.taskService.getTasks(), { initialValue: [] });

  filterType = signal('Todas');
  searchTerm = signal('');

  filteredTasks = computed(() => {
    const tasks = this.allTasks();
    const type = this.filterType();
    const search = this.searchTerm().toLowerCase();
    return tasks.filter(task => {
      const matchesType = type === 'Todas' || task.type === type;
      const matchesSearch = !search || task.name.toLowerCase().includes(search);
      return matchesType && matchesSearch;
    });
  });
}

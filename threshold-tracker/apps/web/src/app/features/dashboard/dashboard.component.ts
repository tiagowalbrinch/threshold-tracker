import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { Task, PagedResponse } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { HttpTaskService } from '../../services/http-task.service';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { AddTaskDialogComponent } from '../../components/add-task-dialog/add-task-dialog.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, TaskCardComponent, AddTaskDialogComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private taskService = inject(TaskService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  authService = inject(AuthService);

  @ViewChild('sentinel') sentinel?: ElementRef;

  tasks = signal<Task[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  search = signal('');
  filterCategory = signal('all');
  showAddTask = signal(false);
  duplicateTaskId = signal<string | null>(null);

  private page = 1;
  private pageSize = 20;
  private hasNextPage = false;
  private observer?: IntersectionObserver;

  categories = ['all', 'tracking', 'flicking', 'switching', 'clicking', 'other'];

  filteredTasks = computed(() => {
    const q = this.search().toLowerCase();
    const cat = this.filterCategory();
    return this.tasks().filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(q);
      const matchesCategory = cat === 'all' || t.category === cat;
      return matchesSearch && matchesCategory;
    });
  });

  ngOnInit() {
    this.loadPage(1);
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.sentinel) return;

    this.observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && this.hasNextPage && !this.loadingMore()) {
        this.loadPage(this.page + 1);
      }
    }, { threshold: 0.1 });

    this.observer.observe(this.sentinel.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private loadPage(page: number) {
    if (page === 1) {
      this.loading.set(true);
    } else {
      this.loadingMore.set(true);
    }

    const httpTaskService = this.taskService as any;
    const request$ = httpTaskService.getPaged
      ? httpTaskService.getPaged(page, this.pageSize)
      : this.taskService.getAll();

    request$.subscribe({
      next: (result: PagedResponse<Task> | Task[]) => {
        if (Array.isArray(result)) {
          this.tasks.set(result);
          this.hasNextPage = false;
        } else {
          const paged = result as PagedResponse<Task>;
          if (page === 1) {
            this.tasks.set(paged.items);
          } else {
            this.tasks.update(t => [...t, ...paged.items]);
          }
          this.hasNextPage = paged.has_next_page;
          this.page = page;
        }
        this.loading.set(false);
        this.loadingMore.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadingMore.set(false);
      }
    });
  }

  categoryLabel(cat: string): string {
    return cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1);
  }

  onTaskCreated(taskData: Partial<Task>) {
    this.duplicateTaskId.set(null);
    this.taskService.create(taskData).subscribe({
      next: (newTask) => {
        this.tasks.update(tasks => [newTask, ...tasks]);
        this.showAddTask.set(false);
      },
      error: (err) => {
        if (err.status === 409) {
          const existingId = err.error?.existing_task_id ?? err.error?.existingTaskId;
          if (existingId) {
            this.duplicateTaskId.set(existingId);
          }
        }
      }
    });
  }

  goToExistingTask() {
    const id = this.duplicateTaskId();
    if (id) {
      this.showAddTask.set(false);
      this.duplicateTaskId.set(null);
      this.router.navigate(['/task', id]);
    }
  }
}

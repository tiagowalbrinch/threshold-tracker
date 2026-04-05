import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { UserTaskStat, TaskCatalogItem } from '../../models/task.model';
import { PagedResponse } from '../../models/score.model';
import { TaskService } from '../../services/task.service';
import { SyncService } from '../../services/sync.service';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { TaskCatalogCardComponent } from '../../components/task-catalog-card/task-catalog-card.component';
import { AuthService } from '../../services/auth.service';
import { DateRangeSelectComponent, dateRangeToParams } from '../../components/date-range-select/date-range-select.component';

const PAGE_SIZE = 24;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, TaskCardComponent, TaskCatalogCardComponent, DateRangeSelectComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private taskService = inject(TaskService);
  private syncService = inject(SyncService);
  authService = inject(AuthService);

  // View mode
  activeTab = signal<'my-tasks' | 'catalog'>('my-tasks');

  // MyTasks state
  tasks = signal<UserTaskStat[]>([]);
  loadingTasks = signal(true);
  syncing = signal(false);

  // Catalog state
  catalogItems = signal<TaskCatalogItem[]>([]);
  catalogTotal = signal(0);
  catalogPage = signal(1);
  loadingCatalog = signal(false);
  loadingMore = signal(false);
  hasMore = computed(() => this.catalogItems().length < this.catalogTotal());

  // Filters (shared)
  search = signal('');
  filterCategory = signal('all');

  // Filters (my-tasks only)
  orderBy = signal('recently_played');
  dateRange = signal('all');


  // Catalog order
  catalogOrderBy = signal('recently_played');

  categories = ['all', 'tracking', 'flicking', 'switching', 'clicking', 'other'];

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.activeTab.set('catalog');
      this.loadCatalog();
    } else {
      this.loadMyTasks();
    }
  }

  onTabChange(tab: 'my-tasks' | 'catalog') {
    this.activeTab.set(tab);
    this.search.set('');
    this.filterCategory.set('all');
    this.dateRange.set('all');
    if (tab === 'catalog') {
      this.catalogItems.set([]);
      this.catalogPage.set(1);
      this.loadCatalog();
    } else {
      this.loadMyTasks();
    }
  }

  onApplyFilters() {
    if (this.activeTab() === 'catalog') {
      this.catalogItems.set([]);
      this.catalogPage.set(1);
      this.loadCatalog();
    } else {
      this.loadMyTasks();
    }
  }

  onLoadMore() {
    this.catalogPage.update(p => p + 1);
    this.loadCatalog(true);
  }

  onSync() {
    this.syncing.set(true);
    this.syncService.sync().subscribe({
      next: (tasks) => { this.tasks.set(tasks); this.syncing.set(false); },
      error: () => this.syncing.set(false)
    });
  }

  categoryLabel(cat: string): string {
    return cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1);
  }

  private loadMyTasks() {
    this.loadingTasks.set(true);
    const { from, to } = dateRangeToParams(this.dateRange());
    this.taskService.getAll({
      name: this.search() || undefined,
      category: this.filterCategory() !== 'all' ? this.filterCategory() : undefined,
      order_by: this.orderBy(),
      played_from: from,
      played_to: to,
    }).subscribe({
      next: (tasks) => { this.tasks.set(tasks); this.loadingTasks.set(false); },
      error: () => this.loadingTasks.set(false)
    });
  }

  private loadCatalog(append = false) {
    if (append) {
      this.loadingMore.set(true);
    } else {
      this.loadingCatalog.set(true);
    }

    this.taskService.getCatalog({
      name: this.search() || undefined,
      category: this.filterCategory() !== 'all' ? this.filterCategory() : undefined,
      order_by: this.catalogOrderBy(),
      page: this.catalogPage(),
      page_size: PAGE_SIZE,
    }).subscribe({
      next: (res: PagedResponse<TaskCatalogItem>) => {
        if (append) {
          this.catalogItems.update(items => [...items, ...res.items]);
          this.loadingMore.set(false);
        } else {
          this.catalogItems.set(res.items);
          this.catalogTotal.set(res.total_count);
          this.loadingCatalog.set(false);
        }
      },
      error: () => {
        this.loadingCatalog.set(false);
        this.loadingMore.set(false);
      }
    });
  }
}

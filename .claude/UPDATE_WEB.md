# ThresholdTracker — Angular Migration Guide

Complete Angular frontend codebase equivalent to the React/Base44 version.

---

## 📦 Project Setup

```bash
ng new threshold-tracker --routing --style=css
cd threshold-tracker
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
npm install ng2-charts chart.js date-fns
```

---

## `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: { extend: {} },
  plugins: [],
}
```

---

## `src/styles.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background: #08080d;
  color: white;
  font-family: sans-serif;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #0a0a0f; }
::-webkit-scrollbar-thumb { background: #1e1e2e; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #2e2e3e; }
```

---

## 📁 Models

### `src/app/models/task.model.ts`

```ts
export interface Task {
  id: string;
  name: string;
  category: 'tracking' | 'flicking' | 'switching' | 'clicking' | 'other';
  threshold?: number;
  personal_best?: number;
  notes?: string;
  created_date?: string;
}
```

### `src/app/models/score.model.ts`

```ts
export interface Score {
  id: string;
  task_id: string;
  value: number;
  is_pb?: boolean;
  sensitivity?: string;
  fov?: number;
  dpi?: number;
  notes?: string;
  created_date?: string;
}
```

---

## 📁 Services

### `src/app/services/task.service.ts`

```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

const API_BASE = 'https://your-backend.com/api'; // 🔁 Replace with your backend URL

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Task[]> {
    return this.http.get<Task[]>(`${API_BASE}/tasks`);
  }

  getById(id: string): Observable<Task> {
    return this.http.get<Task>(`${API_BASE}/tasks/${id}`);
  }

  create(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(`${API_BASE}/tasks`, task);
  }

  update(id: string, data: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${API_BASE}/tasks/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/tasks/${id}`);
  }
}
```

### `src/app/services/score.service.ts`

```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Score } from '../models/score.model';

const API_BASE = 'https://your-backend.com/api'; // 🔁 Replace with your backend URL

@Injectable({ providedIn: 'root' })
export class ScoreService {
  constructor(private http: HttpClient) {}

  getByTask(taskId: string): Observable<Score[]> {
    return this.http.get<Score[]>(`${API_BASE}/scores?task_id=${taskId}`);
  }

  getAll(): Observable<Score[]> {
    return this.http.get<Score[]>(`${API_BASE}/scores`);
  }

  create(score: Partial<Score>): Observable<Score> {
    return this.http.post<Score>(`${API_BASE}/scores`, score);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/scores/${id}`);
  }
}
```

---

## 📁 Layout

### `src/app/layout/layout.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit {
  mobileMenuOpen = false;
  currentRoute = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.currentRoute = e.url;
    });
  }

  logout() {
    // Call your auth logout here
    this.router.navigate(['/login']);
  }
}
```

### `src/app/layout/layout.component.html`

```html
<div class="min-h-screen bg-[#08080d] text-white">

  <!-- Header -->
  <header class="fixed top-0 left-0 right-0 z-50 bg-[#08080d]/80 backdrop-blur-xl border-b border-white/5">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

      <!-- Logo -->
      <a routerLink="/dashboard" class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/>
            <line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/>
            <line x1="12" y1="22" x2="12" y2="18"/>
          </svg>
        </div>
        <span class="font-bold text-lg tracking-tight hidden sm:block">ThresholdTracker</span>
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-1">
        <a routerLink="/dashboard"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          [class]="currentRoute.includes('dashboard') ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'">
          Dashboard
        </a>
      </nav>

      <!-- Right side -->
      <div class="flex items-center gap-3">
        <button (click)="logout()"
          class="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
        <button class="md:hidden p-2 text-white/40" (click)="mobileMenuOpen = !mobileMenuOpen">
          <svg *ngIf="!mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          <svg *ngIf="mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Nav -->
    <div *ngIf="mobileMenuOpen" class="md:hidden border-t border-white/5 bg-[#08080d]/95 p-4">
      <a routerLink="/dashboard" (click)="mobileMenuOpen=false"
        class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/50">
        Dashboard
      </a>
    </div>
  </header>

  <!-- Page Content -->
  <main class="pt-16 min-h-screen">
    <router-outlet></router-outlet>
  </main>
</div>
```

---

## 📁 Dashboard Page

### `src/app/pages/dashboard/dashboard.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { Task } from '../../models/task.model';
import { Score } from '../../models/score.model';
import { TaskService } from '../../services/task.service';
import { ScoreService } from '../../services/score.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  tasks: Task[] = [];
  scores: Score[] = [];
  loading = true;
  search = '';
  filterCategory = 'all';
  showAddTask = false;

  categories = ['all', 'tracking', 'flicking', 'switching', 'clicking', 'other'];

  constructor(
    private taskService: TaskService,
    private scoreService: ScoreService
  ) {}

  ngOnInit() {
    forkJoin({
      tasks: this.taskService.getAll(),
      scores: this.scoreService.getAll()
    }).subscribe(({ tasks, scores }) => {
      this.tasks = tasks;
      this.scores = scores;
      this.loading = false;
    });
  }

  get filteredTasks(): Task[] {
    return this.tasks.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(this.search.toLowerCase());
      const matchesCategory = this.filterCategory === 'all' || t.category === this.filterCategory;
      return matchesSearch && matchesCategory;
    });
  }

  getScoreCount(taskId: string): number {
    return this.scores.filter(s => s.task_id === taskId).length;
  }

  categoryLabel(cat: string): string {
    return cat === 'all' ? 'Todas' : cat.charAt(0).toUpperCase() + cat.slice(1);
  }

  onTaskCreated(taskData: Partial<Task>) {
    this.taskService.create(taskData).subscribe(newTask => {
      this.tasks = [newTask, ...this.tasks];
      this.showAddTask = false;
    });
  }
}
```

### `src/app/pages/dashboard/dashboard.component.html`

```html
<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">

  <!-- Hero -->
  <div class="mb-10">
    <h1 class="text-3xl sm:text-4xl font-bold text-white mb-2">Suas Tasks</h1>
    <p class="text-white/40 text-sm">Acompanhe suas pontuações e determine seu threshold em cada task</p>
  </div>

  <!-- Controls -->
  <div class="flex flex-col sm:flex-row gap-3 mb-8">
    <div class="relative flex-1">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20"
        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input [(ngModel)]="search" placeholder="Buscar task..."
        class="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 outline-none focus:border-white/20" />
    </div>

    <div class="flex gap-2 overflow-x-auto pb-1">
      <button *ngFor="let cat of categories" (click)="filterCategory = cat"
        class="px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
        [class]="filterCategory === cat ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/40 hover:text-white/60'">
        {{ categoryLabel(cat) }}
      </button>
    </div>

    <button (click)="showAddTask = true"
      class="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors shrink-0">
      + Nova Task
    </button>
  </div>

  <!-- Loading -->
  <div *ngIf="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div *ngFor="let i of [1,2,3]" class="bg-white/[0.03] rounded-2xl p-5 h-48 animate-pulse border border-white/5"></div>
  </div>

  <!-- Empty State -->
  <div *ngIf="!loading && filteredTasks.length === 0"
    class="flex flex-col items-center justify-center py-24 text-center">
    <div class="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white/10" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/>
        <line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/>
        <line x1="12" y1="22" x2="12" y2="18"/>
      </svg>
    </div>
    <h3 class="text-white/50 font-medium mb-1">
      {{ tasks.length === 0 ? 'Nenhuma task criada' : 'Nenhum resultado' }}
    </h3>
    <p class="text-white/20 text-sm mb-6">
      {{ tasks.length === 0 ? 'Crie sua primeira task para começar a acompanhar seu progresso' : 'Tente alterar os filtros de busca' }}
    </p>
    <button *ngIf="tasks.length === 0" (click)="showAddTask = true"
      class="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium">
      + Criar primeira task
    </button>
  </div>

  <!-- Task Grid -->
  <div *ngIf="!loading && filteredTasks.length > 0"
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <app-task-card *ngFor="let task of filteredTasks"
      [task]="task"
      [scoreCount]="getScoreCount(task.id)">
    </app-task-card>
  </div>

  <!-- Add Task Modal -->
  <app-add-task-dialog *ngIf="showAddTask"
    (close)="showAddTask = false"
    (save)="onTaskCreated($event)">
  </app-add-task-dialog>
</div>
```

---

## 📁 Task Detail Page

### `src/app/pages/task-detail/task-detail.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Task } from '../../models/task.model';
import { Score } from '../../models/score.model';
import { TaskService } from '../../services/task.service';
import { ScoreService } from '../../services/score.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
})
export class TaskDetailComponent implements OnInit {
  task?: Task;
  scores: Score[] = [];
  loading = true;
  showAddScore = false;
  showSettings = false;
  showDeleteConfirm = false;
  taskId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private scoreService: ScoreService
  ) {}

  ngOnInit() {
    this.taskId = this.route.snapshot.paramMap.get('id') || '';
    forkJoin({
      task: this.taskService.getById(this.taskId),
      scores: this.scoreService.getByTask(this.taskId)
    }).subscribe(({ task, scores }) => {
      this.task = task;
      this.scores = scores.sort((a, b) =>
        new Date(b.created_date!).getTime() - new Date(a.created_date!).getTime()
      );
      this.loading = false;
    });
  }

  get latestScore(): number {
    return this.scores.length > 0 ? this.scores[0].value : 0;
  }

  onAddScore(scoreData: Partial<Score>) {
    const isNewPB = !this.task?.personal_best || scoreData.value! > this.task.personal_best;
    const payload = { ...scoreData, task_id: this.taskId, is_pb: isNewPB };

    this.scoreService.create(payload).subscribe(newScore => {
      this.scores = [newScore, ...this.scores];
      if (isNewPB && this.task) {
        this.task.personal_best = scoreData.value;
        this.taskService.update(this.taskId, { personal_best: scoreData.value }).subscribe();
      }
      this.showAddScore = false;
    });
  }

  onDeleteScore(scoreId: string) {
    this.scoreService.delete(scoreId).subscribe(() => {
      this.scores = this.scores.filter(s => s.id !== scoreId);
    });
  }

  onUpdateThreshold(threshold: number) {
    this.taskService.update(this.taskId, { threshold }).subscribe(updated => {
      if (this.task) this.task.threshold = updated.threshold;
      this.showSettings = false;
    });
  }

  onDeleteTask() {
    const deleteAll = this.scores.map(s => this.scoreService.delete(s.id));
    Promise.all(deleteAll.map(obs => obs.toPromise())).then(() => {
      this.taskService.delete(this.taskId).subscribe(() => {
        this.router.navigate(['/dashboard']);
      });
    });
  }
}
```

### `src/app/pages/task-detail/task-detail.component.html`

```html
<div *ngIf="loading" class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
  <div class="animate-pulse space-y-6">
    <div class="h-8 bg-white/5 rounded w-48"></div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div *ngFor="let i of [1,2,3,4]" class="h-24 bg-white/5 rounded-xl"></div>
    </div>
    <div class="h-64 bg-white/5 rounded-xl"></div>
  </div>
</div>

<div *ngIf="!loading && task" class="max-w-5xl mx-auto px-4 sm:px-6 py-8">

  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <div class="flex items-center gap-3">
      <a routerLink="/dashboard"
        class="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
      </a>
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ task.name }}</h1>
        <span class="text-white/30 text-sm capitalize">{{ task.category }}</span>
      </div>
    </div>
    <div class="flex items-center gap-2 pl-11 sm:pl-0">
      <button (click)="showSettings = !showSettings"
        class="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
        ⚙️
      </button>
      <button (click)="showDeleteConfirm = true"
        class="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
        🗑️
      </button>
      <button (click)="showAddScore = true"
        class="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors">
        + Nova Pontuação
      </button>
    </div>
  </div>

  <!-- Threshold Settings -->
  <div *ngIf="showSettings" class="bg-white/[0.03] rounded-2xl p-5 border border-white/5 mb-6">
    <app-threshold-settings
      [task]="task"
      [scores]="scores"
      (save)="onUpdateThreshold($event)">
    </app-threshold-settings>
  </div>

  <!-- Threshold Indicator -->
  <div *ngIf="task.threshold || task.personal_best" class="mb-6">
    <app-threshold-indicator
      [threshold]="task.threshold || 0"
      [personalBest]="task.personal_best || 0"
      [latestScore]="latestScore">
    </app-threshold-indicator>
  </div>

  <!-- Stats -->
  <div class="mb-6">
    <app-stats-overview
      [scores]="scores"
      [threshold]="task.threshold || 0"
      [personalBest]="task.personal_best || 0">
    </app-stats-overview>
  </div>

  <!-- Chart -->
  <div class="bg-white/[0.03] rounded-2xl p-5 border border-white/5 mb-6">
    <h2 class="text-white/60 text-sm font-medium uppercase tracking-wider mb-4">Evolução de Pontuação</h2>
    <app-score-chart [scores]="scores" [threshold]="task.threshold || 0"></app-score-chart>
  </div>

  <!-- History Table -->
  <div class="bg-white/[0.03] rounded-2xl border border-white/5 overflow-hidden">
    <div class="px-5 py-4 border-b border-white/5">
      <h2 class="text-white/60 text-sm font-medium uppercase tracking-wider">Histórico de Pontuações</h2>
    </div>
    <app-score-history-table [scores]="scores" (delete)="onDeleteScore($event)"></app-score-history-table>
  </div>
</div>

<!-- Delete Confirm Modal -->
<div *ngIf="showDeleteConfirm"
  class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
  <div class="bg-[#0f0f17] border border-white/10 rounded-2xl p-6 max-w-md w-full">
    <h3 class="text-white font-semibold text-lg mb-2">Excluir Task</h3>
    <p class="text-white/40 text-sm mb-6">Isso irá excluir a task e todas as pontuações associadas. Esta ação não pode ser desfeita.</p>
    <div class="flex gap-3 justify-end">
      <button (click)="showDeleteConfirm = false"
        class="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm">Cancelar</button>
      <button (click)="onDeleteTask()"
        class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm">Excluir</button>
    </div>
  </div>
</div>

<!-- Add Score Modal -->
<app-add-score-dialog *ngIf="showAddScore"
  [currentPB]="task?.personal_best || 0"
  (close)="showAddScore = false"
  (save)="onAddScore($event)">
</app-add-score-dialog>
```

---

## 📁 Components

### `src/app/components/task-card/task-card.component.ts`

```ts
import { Component, Input } from '@angular/core';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Input() scoreCount = 0;

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
}
```

### `src/app/components/task-card/task-card.component.html`

```html
<a [routerLink]="['/task', task.id]">
  <div class="group relative bg-gradient-to-br border rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
    [ngClass]="colorClass">
    <div class="flex items-start justify-between mb-4">
      <div class="p-2.5 rounded-xl bg-black/30" [ngClass]="textColor">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/>
          <line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/>
          <line x1="12" y1="22" x2="12" y2="18"/>
        </svg>
      </div>
      <span class="text-xs font-medium text-white/40 uppercase tracking-wider">{{ task.category }}</span>
    </div>

    <h3 class="text-white font-semibold text-lg mb-3 truncate">{{ task.name }}</h3>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <p class="text-white/40 text-xs mb-0.5">Threshold</p>
        <p class="text-lg font-bold" [ngClass]="task.threshold ? textColor : 'text-white/20'">
          {{ task.threshold ? task.threshold.toLocaleString() : '—' }}
        </p>
      </div>
      <div>
        <p class="text-white/40 text-xs mb-0.5">PB</p>
        <p class="text-lg font-bold text-white/80">
          {{ task.personal_best ? task.personal_best.toLocaleString() : '—' }}
        </p>
      </div>
    </div>

    <div class="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
      <span class="text-white/30 text-xs">{{ scoreCount }} attempts</span>
    </div>
  </div>
</a>
```

---

### `src/app/components/threshold-indicator/threshold-indicator.component.ts`

```ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-threshold-indicator',
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
```

### `src/app/components/threshold-indicator/threshold-indicator.component.html`

```html
<div class="space-y-3">
  <div class="relative h-3 bg-white/5 rounded-full overflow-hidden">
    <div *ngIf="threshold > 0"
      class="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-10"
      [style.left.%]="thresholdPct">
    </div>
    <div *ngIf="latestScore > 0"
      class="h-full rounded-full transition-all duration-700"
      [ngClass]="aboveThreshold ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-violet-600 to-violet-400'"
      [style.width.%]="latestPct">
    </div>
  </div>
  <div class="flex items-center gap-4 text-xs text-white/40">
    <div *ngIf="threshold > 0" class="flex items-center gap-1.5">
      <div class="w-2 h-2 rounded-full bg-cyan-400"></div>
      <span>Threshold: {{ threshold.toLocaleString() }}</span>
    </div>
    <div *ngIf="personalBest > 0" class="flex items-center gap-1.5">
      <div class="w-2 h-2 rounded-full bg-amber-400"></div>
      <span>PB: {{ personalBest.toLocaleString() }}</span>
    </div>
  </div>
</div>
```

---

### `src/app/components/stats-overview/stats-overview.component.ts`

```ts
import { Component, Input } from '@angular/core';
import { Score } from '../../models/score.model';

@Component({
  selector: 'app-stats-overview',
  templateUrl: './stats-overview.component.html',
})
export class StatsOverviewComponent {
  @Input() scores: Score[] = [];
  @Input() threshold = 0;
  @Input() personalBest = 0;

  get totalAttempts() { return this.scores.length; }

  get avgScore() {
    if (!this.scores.length) return 0;
    return Math.round(this.scores.reduce((s, sc) => s + sc.value, 0) / this.scores.length);
  }

  get consistencyPct(): number | null {
    if (!this.threshold || !this.scores.length) return null;
    const above = this.scores.filter(s => s.value >= this.threshold).length;
    return Math.round((above / this.scores.length) * 100);
  }
}
```

### `src/app/components/stats-overview/stats-overview.component.html`

```html
<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
  <div class="bg-white/[0.03] rounded-xl p-4 border border-white/5">
    <p class="text-white/40 text-xs uppercase tracking-wider mb-2">Tentativas</p>
    <p class="text-white text-xl font-bold">{{ totalAttempts }}</p>
  </div>
  <div class="bg-white/[0.03] rounded-xl p-4 border border-white/5">
    <p class="text-white/40 text-xs uppercase tracking-wider mb-2">Média</p>
    <p class="text-white text-xl font-bold">{{ avgScore > 0 ? avgScore.toLocaleString() : '—' }}</p>
  </div>
  <div class="bg-white/[0.03] rounded-xl p-4 border border-white/5">
    <p class="text-white/40 text-xs uppercase tracking-wider mb-2">PB</p>
    <p class="text-white text-xl font-bold">{{ personalBest ? personalBest.toLocaleString() : '—' }}</p>
  </div>
  <div class="bg-white/[0.03] rounded-xl p-4 border border-white/5">
    <p class="text-white/40 text-xs uppercase tracking-wider mb-2">Consistência</p>
    <p class="text-white text-xl font-bold">{{ consistencyPct !== null ? consistencyPct + '%' : '—' }}</p>
  </div>
</div>
```

---

### `src/app/components/score-chart/score-chart.component.ts`

```ts
import { Component, Input, OnChanges } from '@angular/core';
import { Score } from '../../models/score.model';
import { format } from 'date-fns';

@Component({
  selector: 'app-score-chart',
  templateUrl: './score-chart.component.html',
})
export class ScoreChartComponent implements OnChanges {
  @Input() scores: Score[] = [];
  @Input() threshold = 0;

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
    this.chartLabels = sorted.map((s, i) => String(i + 1));
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
```

### `src/app/components/score-chart/score-chart.component.html`

```html
<div *ngIf="scores.length === 0" class="flex items-center justify-center h-48 text-white/20 text-sm">
  Nenhuma pontuação registrada ainda
</div>
<canvas *ngIf="scores.length > 0"
  baseChart
  [datasets]="chartData"
  [labels]="chartLabels"
  [options]="chartOptions"
  type="line">
</canvas>
```

---

### `src/app/components/score-history-table/score-history-table.component.ts`

```ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Score } from '../../models/score.model';
import { format } from 'date-fns';

@Component({
  selector: 'app-score-history-table',
  templateUrl: './score-history-table.component.html',
})
export class ScoreHistoryTableComponent {
  @Input() scores: Score[] = [];
  @Output() delete = new EventEmitter<string>();

  formatDate(d: string) { return format(new Date(d), 'dd/MM/yyyy HH:mm'); }
}
```

### `src/app/components/score-history-table/score-history-table.component.html`

```html
<div *ngIf="scores.length === 0" class="text-center py-12 text-white/20 text-sm">
  Nenhuma pontuação registrada
</div>
<div *ngIf="scores.length > 0" class="overflow-x-auto">
  <table class="w-full text-sm">
    <thead>
      <tr class="text-white/30 text-xs uppercase tracking-wider border-b border-white/5">
        <th class="text-left py-3 px-4 font-medium">#</th>
        <th class="text-left py-3 px-4 font-medium">Pontuação</th>
        <th class="text-left py-3 px-4 font-medium">Data</th>
        <th class="text-left py-3 px-4 font-medium">Sense</th>
        <th class="text-left py-3 px-4 font-medium">FOV</th>
        <th class="text-left py-3 px-4 font-medium">DPI</th>
        <th class="text-right py-3 px-4 font-medium"></th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let score of scores; let i = index"
        class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
        <td class="py-3 px-4 text-white/30">{{ scores.length - i }}</td>
        <td class="py-3 px-4">
          <div class="flex items-center gap-2">
            <span class="text-white font-medium">{{ score.value?.toLocaleString() }}</span>
            <span *ngIf="score.is_pb" class="text-amber-400 text-xs">🏆</span>
          </div>
        </td>
        <td class="py-3 px-4 text-white/40">{{ formatDate(score.created_date!) }}</td>
        <td class="py-3 px-4 text-white/40">{{ score.sensitivity || '—' }}</td>
        <td class="py-3 px-4 text-white/40">{{ score.fov || '—' }}</td>
        <td class="py-3 px-4 text-white/40">{{ score.dpi || '—' }}</td>
        <td class="py-3 px-4 text-right">
          <button (click)="delete.emit(score.id)"
            class="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
            🗑️
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

### `src/app/components/threshold-settings/threshold-settings.component.ts`

```ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Task } from '../../models/task.model';
import { Score } from '../../models/score.model';

@Component({
  selector: 'app-threshold-settings',
  templateUrl: './threshold-settings.component.html',
})
export class ThresholdSettingsComponent implements OnInit {
  @Input() task!: Task;
  @Input() scores: Score[] = [];
  @Output() save = new EventEmitter<number>();

  value = '';
  saving = false;
  suggested: number | null = null;

  ngOnInit() {
    this.value = this.task.threshold?.toString() || '';
    this.suggested = this.calculateSuggested();
  }

  calculateSuggested(): number | null {
    if (this.scores.length < 5) return null;
    const values = this.scores.map(s => s.value).sort((a, b) => a - b);
    const trimCount = Math.max(1, Math.floor(values.length * 0.1));
    const trimmed = values.slice(trimCount, values.length - trimCount);
    return Math.round(trimmed[Math.floor(trimmed.length * 0.75)]);
  }

  onSave() {
    const num = parseFloat(this.value);
    if (!num || num <= 0) return;
    this.saving = true;
    this.save.emit(num);
    this.saving = false;
  }
}
```

### `src/app/components/threshold-settings/threshold-settings.component.html`

```html
<div class="space-y-4">
  <div class="space-y-2">
    <label class="text-white/60 text-xs uppercase tracking-wider">Threshold</label>
    <div class="flex gap-2">
      <input type="number" [(ngModel)]="value" placeholder="Defina o threshold..."
        class="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 outline-none focus:border-white/20" />
      <button (click)="onSave()" [disabled]="!value || saving"
        class="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium disabled:opacity-50">
        Salvar
      </button>
    </div>
  </div>
  <button *ngIf="suggested" (click)="value = suggested!.toString()"
    class="flex items-center gap-2 text-sm text-amber-400/80 hover:text-amber-400 transition-colors">
    💡 Threshold sugerido: <strong>{{ suggested!.toLocaleString() }}</strong>
    <span class="text-white/30 ml-1">(baseado em {{ scores.length }} tentativas)</span>
  </button>
  <p *ngIf="scores.length < 5 && scores.length > 0" class="text-white/20 text-xs">
    Registre pelo menos 5 pontuações para receber uma sugestão de threshold
  </p>
</div>
```

---

### `src/app/components/add-task-dialog/add-task-dialog.component.ts`

```ts
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-add-task-dialog',
  templateUrl: './add-task-dialog.component.html',
})
export class AddTaskDialogComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  name = '';
  category = 'clicking';
  notes = '';
  saving = false;

  categories = [
    { value: 'tracking', label: 'Tracking' },
    { value: 'flicking', label: 'Flicking' },
    { value: 'switching', label: 'Switching' },
    { value: 'clicking', label: 'Clicking' },
    { value: 'other', label: 'Outro' },
  ];

  onSave() {
    if (!this.name.trim()) return;
    this.save.emit({
      name: this.name.trim(),
      category: this.category,
      notes: this.notes.trim() || undefined
    });
  }
}
```

### `src/app/components/add-task-dialog/add-task-dialog.component.html`

```html
<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
  <div class="bg-[#0f0f17] border border-white/10 rounded-2xl p-6 max-w-md w-full">
    <h2 class="text-white text-lg font-semibold mb-4">Nova Task</h2>
    <div class="space-y-4">
      <div>
        <label class="text-white/60 text-xs uppercase tracking-wider block mb-2">Nome da Task</label>
        <input [(ngModel)]="name" placeholder="Ex: Gridshot, Sixshot, etc."
          class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 outline-none focus:border-white/20" />
      </div>
      <div>
        <label class="text-white/60 text-xs uppercase tracking-wider block mb-2">Categoria</label>
        <select [(ngModel)]="category"
          class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-white/20">
          <option *ngFor="let c of categories" [value]="c.value" class="bg-[#0f0f17]">{{ c.label }}</option>
        </select>
      </div>
      <div>
        <label class="text-white/60 text-xs uppercase tracking-wider block mb-2">Notas (opcional)</label>
        <textarea [(ngModel)]="notes" placeholder="Detalhes sobre a task..."
          class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 outline-none focus:border-white/20 h-20 resize-none"></textarea>
      </div>
      <div class="flex gap-3 justify-end">
        <button (click)="close.emit()"
          class="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm">Cancelar</button>
        <button (click)="onSave()" [disabled]="!name.trim() || saving"
          class="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
          {{ saving ? 'Salvando...' : 'Criar Task' }}
        </button>
      </div>
    </div>
  </div>
</div>
```

---

### `src/app/components/add-score-dialog/add-score-dialog.component.ts`

```ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-add-score-dialog',
  templateUrl: './add-score-dialog.component.html',
})
export class AddScoreDialogComponent {
  @Input() currentPB = 0;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  value = '';
  sensitivity = '';
  fov = '';
  dpi = '';
  notes = '';
  saving = false;

  get numValue() { return parseFloat(this.value); }
  get isNewPB() { return this.numValue > 0 && (!this.currentPB || this.numValue > this.currentPB); }

  onSave() {
    if (!this.numValue || this.numValue <= 0) return;
    this.save.emit({
      value: this.numValue,
      sensitivity: this.sensitivity.trim() || undefined,
      fov: this.fov ? parseFloat(this.fov) : undefined,
      dpi: this.dpi ? parseFloat(this.dpi) : undefined,
      notes: this.notes.trim() || undefined,
    });
  }
}
```

### `src/app/components/add-score-dialog/add-score-dialog.component.html`

```html
<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
  <div class="bg-[#0f0f17] border border-white/10 rounded-2xl p-6 max-w-md w-full">
    <h2 class="text-white text-lg font-semibold mb-4">Registrar Pontuação</h2>
    <div class="space-y-4">
      <div>
        <label class="text-white/60 text-xs uppercase tracking-wider block mb-2">Pontuação</label>
        <input type="number" [(ngModel)]="value" placeholder="Ex: 85000"
          class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-lg font-semibold placeholder-white/20 outline-none focus:border-white/20" />
        <p *ngIf="isNewPB" class="text-amber-400 text-sm mt-1 animate-pulse">🏆 Novo recorde pessoal!</p>
        <p *ngIf="currentPB > 0" class="text-white/30 text-xs mt-1">PB atual: {{ currentPB.toLocaleString() }}</p>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="text-white/60 text-xs uppercase tracking-wider block mb-2">Sense</label>
          <input [(ngModel)]="sensitivity" placeholder="0.8"
            class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 outline-none" />
        </div>
        <div>
          <label class="text-white/60 text-xs uppercase tracking-wider block mb-2">FOV</label>
          <input type="number" [(ngModel)]="fov" placeholder="103"
            class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 outline-none" />
        </div>
        <div>
          <label class="text-white/60 text-xs uppercase tracking-wider block mb-2">DPI</label>
          <input type="number" [(ngModel)]="dpi" placeholder="800"
            class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 outline-none" />
        </div>
      </div>
      <div>
        <label class="text-white/60 text-xs uppercase tracking-wider block mb-2">Notas (opcional)</label>
        <textarea [(ngModel)]="notes" placeholder="Observações sobre a tentativa..."
          class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 outline-none h-16 resize-none"></textarea>
      </div>
      <div class="flex gap-3 justify-end">
        <button (click)="close.emit()"
          class="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm">Cancelar</button>
        <button (click)="onSave()" [disabled]="!numValue || numValue <= 0 || saving"
          class="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
          {{ saving ? 'Salvando...' : 'Registrar' }}
        </button>
      </div>
    </div>
  </div>
</div>
```

---

## `src/app/app-routing.module.ts`

```ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TaskDetailComponent } from './pages/task-detail/task-detail.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'task/:id', component: TaskDetailComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
```

---

## `src/app/app.module.ts`

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TaskDetailComponent } from './pages/task-detail/task-detail.component';
import { TaskCardComponent } from './components/task-card/task-card.component';
import { ThresholdIndicatorComponent } from './components/threshold-indicator/threshold-indicator.component';
import { StatsOverviewComponent } from './components/stats-overview/stats-overview.component';
import { ScoreChartComponent } from './components/score-chart/score-chart.component';
import { ScoreHistoryTableComponent } from './components/score-history-table/score-history-table.component';
import { ThresholdSettingsComponent } from './components/threshold-settings/threshold-settings.component';
import { AddTaskDialogComponent } from './components/add-task-dialog/add-task-dialog.component';
import { AddScoreDialogComponent } from './components/add-score-dialog/add-score-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    DashboardComponent,
    TaskDetailComponent,
    TaskCardComponent,
    ThresholdIndicatorComponent,
    StatsOverviewComponent,
    ScoreChartComponent,
    ScoreHistoryTableComponent,
    ThresholdSettingsComponent,
    AddTaskDialogComponent,
    AddScoreDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgChartsModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

---

## `src/app/app.component.html`

```html
<router-outlet></router-outlet>
```

---

## 🔁 Things to wire up before running

| Item | What to do |
|------|------------|
| `API_BASE` in services | Replace with your backend URL |
| Auth headers | Add an `HttpInterceptor` that attaches your JWT token |
| `angular.json` styles | Make sure `src/styles.css` is listed |
| `ng2-charts` | Already included via `NgChartsModule` |
| `date-fns` | Already imported in chart and table components |

---

## 📁 Final folder structure

```
src/app/
├── models/
│   ├── task.model.ts
│   └── score.model.ts
├── services/
│   ├── task.service.ts
│   └── score.service.ts
├── layout/
│   ├── layout.component.ts
│   └── layout.component.html
├── pages/
│   ├── dashboard/
│   │   ├── dashboard.component.ts
│   │   └── dashboard.component.html
│   └── task-detail/
│       ├── task-detail.component.ts
│       └── task-detail.component.html
├── components/
│   ├── task-card/
│   ├── threshold-indicator/
│   ├── stats-overview/
│   ├── score-chart/
│   ├── score-history-table/
│   ├── threshold-settings/
│   ├── add-task-dialog/
│   └── add-score-dialog/
├── app-routing.module.ts
├── app.module.ts
└── app.component.html
``
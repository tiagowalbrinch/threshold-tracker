import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { Task } from '../../models/task.model';
import { Score } from '../../models/score.model';
import { TaskService } from '../../services/task.service';
import { ScoreService } from '../../services/score.service';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { AddTaskDialogComponent } from '../../components/add-task-dialog/add-task-dialog.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, TaskCardComponent, AddTaskDialogComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private taskService = inject(TaskService);
  private scoreService = inject(ScoreService);

  tasks = signal<Task[]>([]);
  scores = signal<Score[]>([]);
  loading = signal(true);
  search = signal('');
  filterCategory = signal('all');
  showAddTask = signal(false);

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
    forkJoin({
      tasks: this.taskService.getAll(),
      scores: this.scoreService.getAll()
    }).subscribe({
      next: ({ tasks, scores }) => {
        this.tasks.set(tasks);
        this.scores.set(scores);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load data', err);
        this.loading.set(false);
      }
    });
  }

  getScoreCount(taskId: string): number {
    return this.scores().filter(s => s.task_id === taskId).length;
  }

  categoryLabel(cat: string): string {
    return cat === 'all' ? 'Todas' : cat.charAt(0).toUpperCase() + cat.slice(1);
  }

  onTaskCreated(taskData: Partial<Task>) {
    this.taskService.create(taskData).subscribe(newTask => {
      this.tasks.update(tasks => [newTask, ...tasks]);
      this.showAddTask.set(false);
    });
  }
}

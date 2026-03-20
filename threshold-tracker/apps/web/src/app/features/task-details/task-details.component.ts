import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Task } from '../../models/task.model';
import { Score } from '../../models/score.model';
import { TaskService } from '../../services/task.service';
import { ScoreService } from '../../services/score.service';
import { ThresholdIndicatorComponent } from '../../components/threshold-indicator/threshold-indicator.component';
import { StatsOverviewComponent } from '../../components/stats-overview/stats-overview.component';
import { ScoreChartComponent } from '../../components/score-chart/score-chart.component';
import { ScoreHistoryTableComponent } from '../../components/score-history-table/score-history-table.component';
import { ThresholdSettingsComponent } from '../../components/threshold-settings/threshold-settings.component';
import { AddScoreDialogComponent } from '../../components/add-score-dialog/add-score-dialog.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [
    RouterLink,
    ThresholdIndicatorComponent,
    StatsOverviewComponent,
    ScoreChartComponent,
    ScoreHistoryTableComponent,
    ThresholdSettingsComponent,
    AddScoreDialogComponent,
  ],
  templateUrl: './task-details.component.html',
})
export class TaskDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private taskService = inject(TaskService);
  private scoreService = inject(ScoreService);

  task = signal<Task | undefined>(undefined);
  scores = signal<Score[]>([]);
  loading = signal(true);
  showAddScore = signal(false);
  showSettings = signal(false);
  showDeleteConfirm = signal(false);

  latestScore = computed(() => {
    const s = this.scores();
    return s.length > 0 ? s[0].value : 0;
  });

  private taskId = '';

  ngOnInit() {
    this.taskId = this.route.snapshot.paramMap.get('id') || '';
    forkJoin({
      task: this.taskService.getById(this.taskId),
      scores: this.scoreService.getByTask(this.taskId)
    }).subscribe({
      next: ({ task, scores }) => {
        this.task.set(task);
        this.scores.set(
          scores.sort((a, b) =>
            new Date(b.created_date!).getTime() - new Date(a.created_date!).getTime()
          )
        );
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load task', err);
        this.loading.set(false);
      }
    });
  }

  onAddScore(scoreData: Partial<Score>) {
    const task = this.task();
    const isNewPB = !task?.personal_best || scoreData.value! > task.personal_best;
    const payload = { ...scoreData, task_id: this.taskId, is_pb: isNewPB };

    this.scoreService.create(payload).subscribe(newScore => {
      this.scores.update(s => [newScore, ...s]);
      if (isNewPB) {
        this.task.update(t => t ? { ...t, personal_best: scoreData.value } : t);
        this.taskService.update(this.taskId, { personal_best: scoreData.value }).subscribe();
      }
      this.showAddScore.set(false);
    });
  }

  onDeleteScore(scoreId: string) {
    this.scoreService.delete(scoreId).subscribe(() => {
      this.scores.update(s => s.filter(sc => sc.id !== scoreId));
    });
  }

  onUpdateThreshold(threshold: number) {
    this.taskService.update(this.taskId, { threshold }).subscribe(updated => {
      this.task.update(t => t ? { ...t, threshold: updated.threshold } : t);
      this.showSettings.set(false);
    });
  }

  onDeleteTask() {
    const deletes = this.scores().map(s => this.scoreService.delete(s.id));
    Promise.all(deletes.map(o => o.toPromise())).then(() => {
      this.taskService.delete(this.taskId).subscribe(() => {
        this.router.navigate(['/dashboard']);
      });
    });
  }
}

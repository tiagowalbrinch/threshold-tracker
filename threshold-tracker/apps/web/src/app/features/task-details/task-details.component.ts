import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Task } from '../../models/task.model';
import { Score } from '../../models/score.model';
import { TaskService } from '../../services/task.service';
import { ScoreService } from '../../services/score.service';
import { HttpScoreService } from '../../services/http-score.service';
import { ThresholdIndicatorComponent } from '../../components/threshold-indicator/threshold-indicator.component';
import { StatsOverviewComponent } from '../../components/stats-overview/stats-overview.component';
import { ScoreChartComponent } from '../../components/score-chart/score-chart.component';
import { ScoreHistoryTableComponent } from '../../components/score-history-table/score-history-table.component';
import { ThresholdSettingsComponent } from '../../components/threshold-settings/threshold-settings.component';
import { AddScoreDialogComponent } from '../../components/add-score-dialog/add-score-dialog.component';
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ProfileDefaults {
  default_sensitivity: string | null;
  default_fov: number | null;
  default_dpi: number | null;
}

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
  private http = inject(HttpClient);
  authService = inject(AuthService);

  task = signal<Task | undefined>(undefined);
  scores = signal<Score[]>([]);
  loading = signal(true);
  showAddScore = signal(false);
  showSettings = signal(false);
  showDeleteConfirm = signal(false);
  showMyScores = signal(false);
  profileDefaults = signal<ProfileDefaults | null>(null);

  latestScore = computed(() => {
    const s = this.scores();
    return s.length > 0 ? s[0].value : 0;
  });

  isCreator = computed(() => {
    const user = this.authService.currentUser();
    const task = this.task();
    return !!user && !!task?.created_by_user_id && user.userId === task.created_by_user_id;
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
      error: () => this.loading.set(false)
    });

    if (this.authService.isLoggedIn()) {
      this.http.get<ProfileDefaults>(`${environment.apiUrl}/profile`).subscribe({
        next: (p) => this.profileDefaults.set(p),
        error: () => {}
      });
    }
  }

  toggleMyScores() {
    this.showMyScores.update(v => !v);
    const httpScoreService = this.scoreService as HttpScoreService;

    if (this.showMyScores() && httpScoreService.getByTaskMine) {
      httpScoreService.getByTaskMine(this.taskId).subscribe(scores => {
        this.scores.set(scores.sort((a, b) =>
          new Date(b.created_date!).getTime() - new Date(a.created_date!).getTime()
        ));
      });
    } else {
      this.scoreService.getByTask(this.taskId).subscribe(scores => {
        this.scores.set(scores.sort((a, b) =>
          new Date(b.created_date!).getTime() - new Date(a.created_date!).getTime()
        ));
      });
    }
  }

  onAddScore(scoreData: Partial<Score>) {
    const payload = { ...scoreData, task_id: this.taskId };

    this.scoreService.create(payload).subscribe(newScore => {
      this.scores.update(s => [newScore, ...s]);
      if (newScore.is_pb) {
        this.task.update(t => t ? { ...t, personal_best: newScore.value } : t);
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
    this.taskService.delete(this.taskId).subscribe(() => {
      this.router.navigate(['/dashboard']);
    });
  }
}

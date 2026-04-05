import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { UserTaskStat } from '../../models/task.model';
import { PlayAttempt } from '../../models/score.model';

export interface ThresholdSaveEvent {
  value: number;
  autosyncEnabled: boolean;
}

@Component({
  selector: 'app-threshold-settings',
  standalone: true,
  imports: [],
  templateUrl: './threshold-settings.component.html',
})
export class ThresholdSettingsComponent implements OnInit {
  @Input() task!: UserTaskStat;
  @Input() scores: PlayAttempt[] = [];
  @Output() save = new EventEmitter<ThresholdSaveEvent>();

  value = signal('');
  saving = signal(false);
  suggested = signal<number | null>(null);
  autosyncEnabled = signal(false);

  private readonly RECENT_N = 20;

  ngOnInit() {
    this.value.set(this.task.threshold_value?.toString() || '');
    this.autosyncEnabled.set(this.task.autosync_enabled ?? false);
    this.suggested.set(this.calculateSuggested());
  }

  calculateSuggested(): number | null {
    if (this.scores.length < 5) return null;

    // Only look at the most recent N attempts (scores are sorted oldest→newest)
    const recent = this.scores.slice(-this.RECENT_N);
    const sorted = recent.map(s => s.score).sort((a, b) => a - b);

    // Trim top 20% (at least 1) to remove lucky PB runs
    const trimCount = Math.max(1, Math.floor(sorted.length * 0.20));
    const trimmed = sorted.slice(0, sorted.length - trimCount);

    // 90th percentile of remaining = consistent peak under focused effort
    const idx = Math.floor((trimmed.length - 1) * 0.90);
    return Math.round(trimmed[idx]);
  }

  get suggestedWindowSize(): number {
    return Math.min(this.scores.length, this.RECENT_N);
  }

  onSave() {
    const num = parseFloat(this.value());
    if (!num || num <= 0) return;
    this.saving.set(true);
    this.save.emit({ value: num, autosyncEnabled: this.autosyncEnabled() });
    this.saving.set(false);
  }
}

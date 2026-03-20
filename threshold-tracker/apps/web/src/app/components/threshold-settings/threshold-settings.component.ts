import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { Task } from '../../models/task.model';
import { Score } from '../../models/score.model';

@Component({
  selector: 'app-threshold-settings',
  standalone: true,
  imports: [],
  templateUrl: './threshold-settings.component.html',
})
export class ThresholdSettingsComponent implements OnInit {
  @Input() task!: Task;
  @Input() scores: Score[] = [];
  @Output() save = new EventEmitter<number>();

  value = signal('');
  saving = signal(false);
  suggested = signal<number | null>(null);

  ngOnInit() {
    this.value.set(this.task.threshold?.toString() || '');
    this.suggested.set(this.calculateSuggested());
  }

  calculateSuggested(): number | null {
    if (this.scores.length < 5) return null;
    const values = this.scores.map(s => s.value).sort((a, b) => a - b);
    const trimCount = Math.max(1, Math.floor(values.length * 0.1));
    const trimmed = values.slice(trimCount, values.length - trimCount);
    return Math.round(trimmed[Math.floor(trimmed.length * 0.75)]);
  }

  onSave() {
    const num = parseFloat(this.value());
    if (!num || num <= 0) return;
    this.saving.set(true);
    this.save.emit(num);
    this.saving.set(false);
  }
}

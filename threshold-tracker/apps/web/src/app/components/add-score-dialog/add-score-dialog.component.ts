import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';

@Component({
  selector: 'app-add-score-dialog',
  standalone: true,
  imports: [],
  templateUrl: './add-score-dialog.component.html',
})
export class AddScoreDialogComponent {
  @Input() currentPB = 0;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  value = signal('');
  sensitivity = signal('');
  fov = signal('');
  dpi = signal('');
  notes = signal('');

  numValue = computed(() => parseFloat(this.value()));
  isNewPB = computed(() => this.numValue() > 0 && (!this.currentPB || this.numValue() > this.currentPB));

  onSave() {
    if (!this.numValue() || this.numValue() <= 0) return;
    this.save.emit({
      value: this.numValue(),
      sensitivity: this.sensitivity().trim() || undefined,
      fov: this.fov() ? parseFloat(this.fov()) : undefined,
      dpi: this.dpi() ? parseFloat(this.dpi()) : undefined,
      notes: this.notes().trim() || undefined,
    });
  }
}

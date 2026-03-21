import { Component, Input, OnInit, Output, EventEmitter, signal, computed } from '@angular/core';

@Component({
  selector: 'app-add-score-dialog',
  standalone: true,
  imports: [],
  templateUrl: './add-score-dialog.component.html',
})
export class AddScoreDialogComponent implements OnInit {
  @Input() currentPB = 0;
  @Input() defaultSensitivity: string | null | undefined = undefined;
  @Input() defaultFov: number | null | undefined = undefined;
  @Input() defaultDpi: number | null | undefined = undefined;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  value = signal('');
  sensitivity = signal('');
  fov = signal('');
  dpi = signal('');
  notes = signal('');

  numValue = computed(() => parseFloat(this.value()));
  isNewPB = computed(() => this.numValue() > 0 && (!this.currentPB || this.numValue() > this.currentPB));

  ngOnInit() {
    if (this.defaultSensitivity) this.sensitivity.set(this.defaultSensitivity);
    if (this.defaultFov) this.fov.set(this.defaultFov.toString());
    if (this.defaultDpi) this.dpi.set(this.defaultDpi.toString());
  }

  onSave() {
    if (!this.numValue() || this.numValue() <= 0) return;
    this.save.emit({
      value: this.numValue(),
      sensitivity: this.sensitivity().trim() || undefined,
      fov: this.fov() ? parseFloat(this.fov()) : undefined,
      dpi: this.dpi() ? parseInt(this.dpi()) : undefined,
      notes: this.notes().trim() || undefined,
    });
  }
}

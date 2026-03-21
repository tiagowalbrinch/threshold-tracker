import { Component, Input, Output, EventEmitter, signal } from '@angular/core';

@Component({
  selector: 'app-add-task-dialog',
  standalone: true,
  imports: [],
  templateUrl: './add-task-dialog.component.html',
})
export class AddTaskDialogComponent {
  @Input() duplicateTaskId: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @Output() goToExisting = new EventEmitter<void>();

  name = signal('');
  category = signal('clicking');
  notes = signal('');

  categories = [
    { value: 'tracking', label: 'Tracking' },
    { value: 'flicking', label: 'Flicking' },
    { value: 'switching', label: 'Switching' },
    { value: 'clicking', label: 'Clicking' },
    { value: 'other', label: 'Other' },
  ];

  onSave() {
    if (!this.name().trim()) return;
    this.save.emit({
      name: this.name().trim(),
      category: this.category(),
      notes: this.notes().trim() || undefined,
    });
  }
}

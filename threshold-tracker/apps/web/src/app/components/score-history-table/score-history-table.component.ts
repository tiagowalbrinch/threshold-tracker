import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Score } from '../../models/score.model';
import { format } from 'date-fns';

@Component({
  selector: 'app-score-history-table',
  standalone: true,
  imports: [],
  templateUrl: './score-history-table.component.html',
})
export class ScoreHistoryTableComponent {
  @Input() scores: Score[] = [];
  @Output() delete = new EventEmitter<string>();

  formatDate(d: string) { return format(new Date(d), 'dd/MM/yyyy HH:mm'); }
}

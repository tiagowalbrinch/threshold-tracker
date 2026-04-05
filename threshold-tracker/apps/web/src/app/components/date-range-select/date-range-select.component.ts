import { Component, Input, Output, EventEmitter } from '@angular/core';

export const DATE_RANGE_OPTIONS = [
  { value: 'all',           label: 'All time' },
  { value: 'last_7_days',   label: 'Last 7 days' },
  { value: 'last_30_days',  label: 'Last 30 days' },
  { value: 'last_3_months', label: 'Last 3 months' },
  { value: 'last_6_months', label: 'Last 6 months' },
  { value: 'last_year',     label: 'Last year' },
  { value: 'yesterday',     label: 'Yesterday' },
  { value: '2_days_ago',    label: '2 days ago' },
];

export function dateRangeToParams(range: string): { from?: string; to?: string } {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const startOfDay = (d: Date) => { d.setHours(0, 0, 0, 0); return d; };
  const endOfDay   = (d: Date) => { d.setHours(23, 59, 59, 999); return d; };
  const daysAgo    = (n: number) => { const d = new Date(now); d.setDate(d.getDate() - n); return d; };
  const monthsAgo  = (n: number) => { const d = new Date(now); d.setMonth(d.getMonth() - n); return d; };

  switch (range) {
    case 'last_7_days':   return { from: fmt(startOfDay(daysAgo(7))) };
    case 'last_30_days':  return { from: fmt(startOfDay(daysAgo(30))) };
    case 'last_3_months': return { from: fmt(startOfDay(monthsAgo(3))) };
    case 'last_6_months': return { from: fmt(startOfDay(monthsAgo(6))) };
    case 'last_year':     return { from: fmt(startOfDay(monthsAgo(12))) };
    case 'yesterday':     return { from: fmt(startOfDay(daysAgo(1))), to: fmt(endOfDay(daysAgo(1))) };
    case '2_days_ago':    return { from: fmt(startOfDay(daysAgo(2))), to: fmt(endOfDay(daysAgo(2))) };
    default:              return {};
  }
}

@Component({
  selector: 'app-date-range-select',
  standalone: true,
  imports: [],
  template: `
    <select [value]="value" (change)="rangeChange.emit($any($event.target).value)"
      class="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs outline-none focus:border-white/20 cursor-pointer [&>option]:bg-[#0f0f17] [&>option]:text-white">
      @for (opt of options; track opt.value) {
        <option [value]="opt.value">{{ opt.label }}</option>
      }
    </select>
  `,
})
export class DateRangeSelectComponent {
  @Input() value = 'all';
  @Output() rangeChange = new EventEmitter<string>();
  readonly options = DATE_RANGE_OPTIONS;
}

const COLOR_CLASS_MAP: Record<string, string> = {
  tracking:  'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
  flicking:  'from-violet-500/20 to-violet-500/5 border-violet-500/30',
  switching: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
  clicking:  'from-rose-500/20 to-rose-500/5 border-rose-500/30',
  other:     'from-slate-500/20 to-slate-500/5 border-slate-500/30',
};

const TEXT_COLOR_MAP: Record<string, string> = {
  tracking:  'text-cyan-400',
  flicking:  'text-violet-400',
  switching: 'text-amber-400',
  clicking:  'text-rose-400',
  other:     'text-slate-400',
};

export function categoryColorClass(category: string): string {
  return COLOR_CLASS_MAP[category] ?? COLOR_CLASS_MAP['other'];
}

export function categoryTextColor(category: string): string {
  return TEXT_COLOR_MAP[category] ?? TEXT_COLOR_MAP['other'];
}

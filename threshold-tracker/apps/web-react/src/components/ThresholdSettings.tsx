import { useState, useEffect } from 'react';
import { UserTaskStat } from '../models/task';

interface Props {
  task: UserTaskStat;
  onSave: (data: { value: number; autosyncEnabled: boolean }) => void;
}

export function ThresholdSettings({ task, onSave }: Props) {
  const [value, setValue] = useState(task.threshold_value?.toString() ?? '');
  const [autosyncEnabled, setAutosyncEnabled] = useState(task.autosync_enabled ?? true);
  const suggested = task.suggested_threshold ?? null;

  useEffect(() => {
    setValue(task.threshold_value?.toString() ?? '');
    setAutosyncEnabled(task.autosync_enabled ?? true);
  }, [task.aimlabs_task_id]);

  function handleSave() {
    const num = parseFloat(value);
    if (!num || num <= 0) return;
    onSave({ value: num, autosyncEnabled });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-white/60 text-xs uppercase tracking-wider">Threshold</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Set your threshold..."
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 outline-none focus:border-white/20"
          />
          <button
            onClick={handleSave}
            disabled={!value}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>

      {/* Autosync toggle */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={autosyncEnabled}
            onChange={e => setAutosyncEnabled(e.target.checked)}
          />
          <div className={`w-9 h-5 rounded-full transition-colors ${autosyncEnabled ? 'bg-violet-600' : 'bg-white/10'}`} />
          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${autosyncEnabled ? 'translate-x-4' : ''}`} />
        </div>
        <span className="text-white/60 text-sm group-hover:text-white/80 transition-colors">
          Auto-recalculate (once per day)
        </span>
      </label>

      {suggested && (
        <div className="space-y-1.5">
          <button
            onClick={() => setValue(suggested.toString())}
            className="flex items-center gap-2 text-sm text-amber-400/80 hover:text-amber-400 transition-colors"
          >
            💡 Suggested threshold: <strong>{suggested.toLocaleString()}</strong>
          </button>
          <p className="text-white/25 text-xs pl-0.5">
            Best consistent score excluding lucky peaks — what you can repeat with focused effort.
          </p>
        </div>
      )}

    </div>
  );
}

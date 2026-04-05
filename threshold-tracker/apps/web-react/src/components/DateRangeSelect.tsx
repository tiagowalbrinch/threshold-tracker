import { DATE_RANGE_OPTIONS } from '../utils/dateRange';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function DateRangeSelect({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs outline-none focus:border-white/20 cursor-pointer [&>option]:bg-[#0f0f17] [&>option]:text-white"
    >
      {DATE_RANGE_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

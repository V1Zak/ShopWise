interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  className?: string;
}

export function ProgressBar({ value, max = 100, color = 'bg-primary', className = '' }: ProgressBarProps) {
  const percent = Math.min(100, (value / max) * 100);
  return (
    <div className={`w-full bg-surface-active rounded-full h-1.5 overflow-hidden ${className}`}>
      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${percent}%` }} />
    </div>
  );
}

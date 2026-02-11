interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  centerLabel: string;
  centerValue: string;
  size?: number;
}

export function DonutChart({ segments, centerLabel, centerValue, size = 192 }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-surface-active"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />
          {segments.map((seg) => {
            const pct = (seg.value / total) * 100;
            const el = (
              <path
                key={seg.label}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={seg.color}
                strokeWidth="4"
                strokeDasharray={`${pct}, 100`}
                strokeDashoffset={`${-offset}`}
              />
            );
            offset += pct;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-text">{centerValue}</span>
          <span className="text-xs text-text-muted uppercase tracking-wide">{centerLabel}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-3 w-full">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="text-text-muted">{seg.label}</span>
            </div>
            <span className="font-bold text-text">${seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

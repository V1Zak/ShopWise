interface BarData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarData[];
  maxValue?: number;
  highlightIndex?: number;
}

export function BarChart({ data, maxValue, highlightIndex }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value));

  return (
    <div className="flex-1 min-h-[240px] flex items-end justify-between gap-4 pt-4 px-2">
      {data.map((bar, i) => {
        const heightPercent = (bar.value / max) * 100;
        const isHighlight = highlightIndex === i;
        return (
          <div key={bar.label} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
            <div className="relative w-full bg-surface-active/30 rounded-t-sm h-48 flex items-end justify-center overflow-hidden">
              <div
                className={`w-full rounded-t-sm transition-all duration-300 ${
                  isHighlight
                    ? 'bg-primary shadow-[0_0_15px_rgba(19,236,128,0.3)]'
                    : 'bg-primary/80 group-hover:bg-primary'
                }`}
                style={{ height: `${heightPercent}%` }}
              />
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-text text-text-inv text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 font-mono">
                ${bar.value}
              </div>
            </div>
            <span className={`text-xs font-medium transition-colors ${isHighlight ? 'text-primary font-bold' : 'text-text-muted group-hover:text-primary'}`}>
              {bar.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

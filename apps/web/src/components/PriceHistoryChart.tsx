import { useId } from 'react';
import type { PriceHistoryEntry } from '@shopwise/shared';

interface PriceHistoryChartProps {
  entries: PriceHistoryEntry[];
  width?: number;
  height?: number;
  className?: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function computeTrend(entries: PriceHistoryEntry[]): { direction: 'up' | 'down' | 'stable'; percent: number } {
  if (entries.length < 2) return { direction: 'stable', percent: 0 };
  const newest = entries[0].price;
  const oldest = entries[entries.length - 1].price;
  if (oldest === 0) return { direction: 'stable', percent: 0 };
  const change = ((newest - oldest) / oldest) * 100;
  if (Math.abs(change) < 1) return { direction: 'stable', percent: 0 };
  return { direction: change > 0 ? 'up' : 'down', percent: Math.abs(change) };
}

export function PriceHistoryChart({
  entries,
  width = 320,
  height = 140,
  className = '',
}: PriceHistoryChartProps) {
  const gradientId = useId();

  if (entries.length < 2) {
    return (
      <div className={`flex items-center justify-center text-text-secondary text-sm ${className}`} style={{ height }}>
        Not enough data to chart
      </div>
    );
  }

  const chronological = [...entries].reverse();
  const prices = chronological.map((e) => e.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const padding = { top: 20, right: 12, bottom: 32, left: 44 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = chronological.map((entry, i) => ({
    x: padding.left + (i / (chronological.length - 1)) * chartW,
    y: padding.top + chartH - ((entry.price - min) / range) * chartH,
    price: entry.price,
    date: formatDate(entry.recordedAt),
    storeName: entry.storeName,
  }));

  const linePath = points
    .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
    .join(' ');

  const areaPath = `${linePath} L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`;

  const yTicks = [min, min + range / 2, max];
  const xLabelIndices = [0, Math.floor(chronological.length / 2), chronological.length - 1];

  const trend = computeTrend(entries);

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-text-secondary text-xs uppercase font-medium tracking-wide">Price Trend</span>
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded ${
            trend.direction === 'up'
              ? 'text-red-400 bg-red-400/10'
              : trend.direction === 'down'
                ? 'text-primary bg-primary/10'
                : 'text-text-secondary bg-white/5'
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {trend.direction === 'up' ? 'trending_up' : trend.direction === 'down' ? 'trending_down' : 'trending_flat'}
          </span>
          {trend.percent > 0 ? `${trend.percent.toFixed(1)}%` : 'Stable'}
        </span>
      </div>

      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#13ec80" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#13ec80" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y = padding.top + chartH - ((tick - min) / range) * chartH;
          return (
            <g key={tick}>
              <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="#2a4a3a" strokeDasharray="4 4" strokeWidth="1" />
              <text x={padding.left - 6} y={y + 4} textAnchor="end" className="fill-gray-500 text-[10px] font-mono">
                ${tick.toFixed(2)}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke="#13ec80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 5 : 3} fill={i === points.length - 1 ? '#11221a' : '#13ec80'} stroke="#13ec80" strokeWidth={i === points.length - 1 ? 2.5 : 0} />
        ))}

        {xLabelIndices.map((idx) => {
          const p = points[idx];
          if (!p) return null;
          return (
            <text key={idx} x={p.x} y={padding.top + chartH + 16} textAnchor="middle" className="fill-gray-500 text-[10px]">
              {p.date}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

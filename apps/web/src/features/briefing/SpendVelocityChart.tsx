import { useMemo } from 'react';
import { useTripsStore } from '@/store/trips-store';
import type { ShoppingTrip } from '@shopwise/shared';
import { useCurrency } from '@/hooks/useCurrency';

interface Props {
  trip: ShoppingTrip;
}

export function SpendVelocityChart({ trip }: Props) {
  const allTrips = useTripsStore((s) => s.trips);
  const { formatPrice } = useCurrency();

  const { points, avgY, labels, currentIdx } = useMemo(() => {
    // Get recent trips sorted by date ascending, include current
    const sorted = [...allTrips]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-8); // last 8 trips

    if (sorted.length === 0) {
      return { points: [], avgY: 0, labels: [], currentIdx: -1 };
    }

    const max = Math.max(...sorted.map((t) => t.totalSpent), 1);
    const width = 800;
    const height = 220;
    const padding = 30;

    const pts = sorted.map((t, i) => ({
      x: sorted.length === 1 ? width / 2 : padding + (i / (sorted.length - 1)) * (width - padding * 2),
      y: height - (t.totalSpent / max) * (height - padding),
      spent: t.totalSpent,
      id: t.id,
    }));

    const avg = sorted.reduce((s, t) => s + t.totalSpent, 0) / sorted.length;
    const avgLineY = height - (avg / max) * (height - padding);

    const dateLabels = sorted.map((t) =>
      new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    );

    const idx = sorted.findIndex((t) => t.id === trip.id);

    return { points: pts, avgY: avgLineY, labels: dateLabels, currentIdx: idx };
  }, [allTrips, trip.id]);

  const hasData = points.length > 0;

  // Build SVG path from points
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = hasData
    ? `${linePath} L${points[points.length - 1].x},250 L${points[0].x},250 Z`
    : '';

  return (
    <div className="rounded-xl bg-surface border border-border p-6 flex-1 min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-text text-lg font-bold">Spend Velocity</h3>
          <p className="text-text-muted text-sm">
            {hasData
              ? `Last ${points.length} trips vs. average (${formatPrice(points.reduce((s, p) => s + p.spent, 0) / points.length)})`
              : 'No trip data available'}
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded text-xs font-medium bg-primary/20 text-primary border border-primary/20">Current Trip</span>
          <span className="px-3 py-1 rounded text-xs font-medium bg-surface-active/50 text-text-muted border border-border">Average</span>
        </div>
      </div>
      <div className="w-full h-64 relative mt-8">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-full text-text-muted">
            <span className="material-symbols-outlined text-[32px] mb-2">show_chart</span>
            <p className="text-sm">Complete more trips to see your spending trend</p>
          </div>
        ) : (
          <>
            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 250">
              {/* Grid lines */}
              {[0, 62.5, 125, 187.5].map((y) => (
                <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="rgb(var(--color-border))" strokeDasharray="4 4" strokeWidth="1" />
              ))}
              <line x1="0" y1="250" x2="800" y2="250" stroke="rgb(var(--color-border))" strokeWidth="1" />
              {/* Average line */}
              <line x1="0" y1={avgY} x2="800" y2={avgY} stroke="rgb(var(--color-text-muted) / 0.5)" strokeDasharray="5,5" strokeWidth="2" />
              {/* Gradient */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="rgb(var(--color-primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Area fill */}
              <path d={areaPath} fill="url(#chartGradient)" />
              {/* Trip line */}
              <path d={linePath} fill="none" stroke="rgb(var(--color-primary))" strokeWidth="3" />
              {/* Data points */}
              {points.map((p, i) => (
                <circle
                  key={p.id}
                  cx={p.x}
                  cy={p.y}
                  r={i === currentIdx ? 6 : 4}
                  fill={i === currentIdx ? 'rgb(var(--color-bg))' : 'rgb(var(--color-primary))'}
                  stroke={i === currentIdx ? 'rgb(var(--color-primary))' : 'none'}
                  strokeWidth={i === currentIdx ? 3 : 0}
                />
              ))}
            </svg>
            <div className="flex justify-between mt-4 text-xs text-text-muted font-mono">
              {labels.map((label, i) => (
                <span key={i} className={i === currentIdx ? 'text-primary font-bold' : ''}>
                  {label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { Icon } from './Icon';
import { TrendBadge } from './TrendBadge';

interface StatCardProps {
  label: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  icon: string;
  iconColor?: string;
  children?: React.ReactNode;
  highlight?: boolean;
}

export function StatCard({ label, value, trend, trendLabel, icon, iconColor = 'text-primary', children, highlight }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl p-5 border shadow-sm group ${highlight ? 'bg-surface border-primary/30 ring-1 ring-primary/20' : 'bg-surface border-border'}`}>
      {highlight && <div className="absolute -right-6 -top-6 bg-primary/20 rounded-full h-32 w-32 blur-2xl" />}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon name={icon} className={`text-6xl ${iconColor}`} />
      </div>
      <div className="relative z-10">
        <p className="text-text-muted text-sm font-medium mb-1">{label}</p>
        <div className="flex items-baseline gap-2 mb-2">
          <h3 className={`text-3xl font-bold ${highlight ? 'text-primary' : 'text-text'}`}>{value}</h3>
          {trend !== undefined && <TrendBadge value={trend} label={trendLabel} />}
        </div>
        {children}
      </div>
    </div>
  );
}

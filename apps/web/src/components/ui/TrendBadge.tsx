interface TrendBadgeProps {
  value: number;
  label?: string;
}

export function TrendBadge({ value, label }: TrendBadgeProps) {
  const isPositive = value >= 0;
  const colorClass = isPositive ? 'text-primary bg-primary/10' : 'text-danger bg-danger/10';
  const displayValue = label || `${isPositive ? '+' : ''}${value}%`;

  return (
    <span className={`${colorClass} px-1.5 py-0.5 rounded text-xs font-medium`}>
      {displayValue}
    </span>
  );
}

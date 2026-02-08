interface BadgeProps {
  children: React.ReactNode;
  color?: 'primary' | 'danger' | 'warning' | 'info' | 'default';
}

const colorMap = {
  primary: 'text-primary bg-primary/10 border-primary/20',
  danger: 'text-danger bg-danger/10 border-danger/20',
  warning: 'text-warning bg-warning/10 border-warning/20',
  info: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  default: 'text-text-secondary bg-background-dark border-border-dark',
};

export function Badge({ children, color = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorMap[color]}`}>
      {children}
    </span>
  );
}

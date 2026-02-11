import { Icon } from './Icon';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-surface flex items-center justify-center mb-4">
        <Icon name={icon} className="text-3xl text-text-muted" />
      </div>
      <h3 className="text-text font-bold text-lg mb-1">{title}</h3>
      <p className="text-text-muted text-sm max-w-sm">{description}</p>
    </div>
  );
}

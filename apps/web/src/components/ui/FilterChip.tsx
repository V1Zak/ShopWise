interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
        active
          ? 'bg-primary/20 text-primary border-primary/30 hover:bg-primary hover:text-black font-semibold'
          : 'bg-surface-dark text-text-secondary border-border-dark hover:text-white hover:border-text-secondary'
      }`}
    >
      {label}
    </button>
  );
}

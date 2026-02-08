interface ToggleGroupProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function ToggleGroup({ options, value, onChange }: ToggleGroupProps) {
  return (
    <div className="flex items-center bg-surface-dark rounded-lg p-1 border border-border-dark">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            value === opt
              ? 'bg-accent-green text-white shadow-sm'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

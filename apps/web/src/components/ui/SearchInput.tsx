interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }: SearchInputProps) {
  return (
    <div className="relative group w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
        <span aria-hidden="true" className="material-symbols-outlined">search</span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-lg bg-surface border border-border py-2.5 pl-10 pr-3 text-sm placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-text"
        placeholder={placeholder}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
        <span className="text-xs text-text-muted bg-surface-active px-1.5 py-0.5 rounded border border-border">⌘K</span>
      </div>
    </div>
  );
}

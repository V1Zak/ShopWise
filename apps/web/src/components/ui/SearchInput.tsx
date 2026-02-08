interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }: SearchInputProps) {
  return (
    <div className="relative group w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary group-focus-within:text-primary transition-colors">
        <span className="material-symbols-outlined">search</span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-lg bg-surface-dark border border-border-dark py-2.5 pl-10 pr-3 text-sm placeholder-text-secondary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-white"
        placeholder={placeholder}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
        <span className="text-xs text-text-secondary bg-accent-green px-1.5 py-0.5 rounded border border-border-dark">⌘K</span>
      </div>
    </div>
  );
}

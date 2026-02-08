const suggestions = ['Pizza Dough', 'Mozzarella', 'Beer'];

export function SmartSuggestions() {
  return (
    <div className="bg-gradient-to-br from-accent-green to-background-dark rounded-xl border border-border-dark p-5 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full -mr-10 -mt-10" />
      <h3 className="text-white font-bold text-base mb-2 relative z-10">Smart Suggestions</h3>
      <p className="text-text-secondary text-sm mb-4 relative z-10">
        Based on your Friday habits, you usually buy:
      </p>
      <div className="flex flex-wrap gap-2 relative z-10">
        {suggestions.map((item) => (
          <button
            key={item}
            className="flex items-center gap-2 px-3 py-1.5 bg-background-dark hover:bg-surface-dark border border-border-dark rounded-lg text-xs text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

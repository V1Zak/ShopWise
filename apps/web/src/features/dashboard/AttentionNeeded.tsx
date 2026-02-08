const alerts = [
  { color: 'bg-red-500', title: 'Milk expires soon', sub: '2 days remaining' },
  { color: 'bg-yellow-500', title: 'Coffee beans low stock', sub: '~3 servings left' },
  { color: 'bg-blue-500', title: 'Review monthly recurring', sub: 'Due tomorrow' },
];

export function AttentionNeeded() {
  return (
    <div className="bg-surface-dark rounded-xl border border-border-dark p-5">
      <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-yellow-400">warning</span>
        Attention Needed
      </h3>
      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <div key={i} className="flex items-start gap-3 bg-background-dark p-3 rounded-lg border border-border-dark/50">
            <div className={`h-2 w-2 rounded-full ${alert.color} mt-1.5 flex-shrink-0`} />
            <div>
              <p className="text-sm text-white font-medium">{alert.title}</p>
              <p className="text-xs text-text-secondary">{alert.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

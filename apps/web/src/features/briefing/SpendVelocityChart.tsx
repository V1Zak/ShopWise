export function SpendVelocityChart() {
  return (
    <div className="rounded-xl bg-surface border border-border p-6 flex-1 min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-text text-lg font-bold">Spend Velocity</h3>
          <p className="text-text-muted text-sm">Comparison against 30-day moving average</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded text-xs font-medium bg-primary/20 text-primary border border-primary/20">Current Trip</span>
          <span className="px-3 py-1 rounded text-xs font-medium bg-surface-active/50 text-text-muted border border-border">Average</span>
        </div>
      </div>
      <div className="w-full h-64 relative mt-8">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 800 250">
          {/* Grid lines */}
          {[0, 62.5, 125, 187.5].map((y) => (
            <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="rgb(var(--color-border))" strokeDasharray="4 4" strokeWidth="1" />
          ))}
          <line x1="0" y1="250" x2="800" y2="250" stroke="rgb(var(--color-border))" strokeWidth="1" />
          {/* Average line */}
          <path d="M0,180 C100,170 200,190 300,160 C400,130 500,150 600,140 C700,130 800,120" fill="none" stroke="rgb(var(--color-text-muted) / 0.5)" strokeDasharray="5,5" strokeWidth="2" />
          {/* Gradient */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(var(--color-primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Current trip line */}
          <path d="M0,200 C100,180 200,210 300,150 C400,100 500,120 600,80 C700,90 800,50" fill="url(#chartGradient)" stroke="rgb(var(--color-primary))" strokeWidth="3" />
          {/* Data points */}
          <circle cx="0" cy="200" r="4" fill="rgb(var(--color-primary))" />
          <circle cx="300" cy="150" r="4" fill="rgb(var(--color-primary))" />
          <circle cx="600" cy="80" r="4" fill="rgb(var(--color-primary))" />
          <circle cx="800" cy="50" r="6" fill="rgb(var(--color-bg))" stroke="rgb(var(--color-primary))" strokeWidth="3" />
        </svg>
        <div className="flex justify-between mt-4 text-xs text-text-muted font-mono">
          <span>Start</span>
          <span>Produce</span>
          <span>Pantry</span>
          <span>Frozen</span>
          <span>Checkout</span>
        </div>
      </div>
    </div>
  );
}

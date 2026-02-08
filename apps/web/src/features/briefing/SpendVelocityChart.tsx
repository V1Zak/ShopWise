export function SpendVelocityChart() {
  return (
    <div className="rounded-xl bg-surface-dark border border-border-dark p-6 flex-1 min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white text-lg font-bold">Spend Velocity</h3>
          <p className="text-gray-400 text-sm">Comparison against 30-day moving average</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded text-xs font-medium bg-primary/20 text-primary border border-primary/20">Current Trip</span>
          <span className="px-3 py-1 rounded text-xs font-medium bg-gray-700/50 text-gray-400 border border-gray-700">Average</span>
        </div>
      </div>
      <div className="w-full h-64 relative mt-8">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 800 250">
          {/* Grid lines */}
          {[0, 62.5, 125, 187.5].map((y) => (
            <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#234836" strokeDasharray="4 4" strokeWidth="1" />
          ))}
          <line x1="0" y1="250" x2="800" y2="250" stroke="#234836" strokeWidth="1" />
          {/* Average line */}
          <path d="M0,180 C100,170 200,190 300,160 C400,130 500,150 600,140 C700,130 800,120" fill="none" stroke="#4b5563" strokeDasharray="5,5" strokeWidth="2" />
          {/* Gradient */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#13ec80" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#13ec80" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Current trip line */}
          <path d="M0,200 C100,180 200,210 300,150 C400,100 500,120 600,80 C700,90 800,50" fill="url(#chartGradient)" stroke="#13ec80" strokeWidth="3" />
          {/* Data points */}
          <circle cx="0" cy="200" r="4" fill="#13ec80" />
          <circle cx="300" cy="150" r="4" fill="#13ec80" />
          <circle cx="600" cy="80" r="4" fill="#13ec80" />
          <circle cx="800" cy="50" r="6" fill="#11221a" stroke="#13ec80" strokeWidth="3" />
        </svg>
        <div className="flex justify-between mt-4 text-xs text-gray-400 font-mono">
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

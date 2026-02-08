export function ProductIntelligence() {
  return (
    <div className="bg-background-dark rounded-xl p-5 border border-border-dark">
      <div className="flex items-start gap-4 mb-4">
        <div className="h-16 w-16 bg-white/5 rounded-lg flex items-center justify-center border border-border-dark">
          <span className="material-symbols-outlined text-3xl text-text-secondary">nutrition</span>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Avocados</h3>
          <div className="text-sm text-primary font-medium">On Sale (-$0.49)</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-surface-dark p-3 rounded-lg">
          <div className="text-text-secondary text-xs uppercase mb-1">Price History</div>
          <div className="text-white font-semibold">$3.99 avg</div>
        </div>
        <div className="bg-surface-dark p-3 rounded-lg">
          <div className="text-text-secondary text-xs uppercase mb-1">Alternatives</div>
          <div className="text-white font-semibold">Organic (+$2)</div>
        </div>
      </div>
      <div className="text-text-secondary text-xs leading-relaxed">
        Tip: Look for darker skin and slight give when pressed gently. Typically located near the entrance of the produce section on the right side.
      </div>
    </div>
  );
}

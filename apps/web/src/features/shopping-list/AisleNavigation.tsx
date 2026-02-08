const steps = [
  { label: 'Produce', items: 'Bananas, Avocados', active: true },
  { label: 'Dairy', items: 'Milk, Yogurt, Cheese', active: false },
  { label: 'Pantry', items: 'Pasta Sauce', active: false },
];

export function AisleNavigation() {
  return (
    <div className="bg-background-dark rounded-xl overflow-hidden border border-border-dark shadow-lg">
      <div className="relative h-56 bg-surface-dark">
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent" />
        <div className="absolute bottom-4 left-4">
          <div className="text-white text-lg font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">location_on</span>
            Aisle 1: Produce
          </div>
          <div className="text-text-secondary text-sm mt-1">Next: Aisle 4 (Dairy)</div>
        </div>
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white border border-white/10">
          Walmart Supercenter
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-white font-semibold">Shopping Route</h4>
          <span className="text-xs text-primary font-medium cursor-pointer hover:underline">View Full Map</span>
        </div>
        <div className="space-y-4 relative">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border-dark" />
          {steps.map((step) => (
            <div key={step.label} className="relative flex gap-3 items-start z-10">
              <div className={`w-6 h-6 rounded-full border-4 border-background-dark shrink-0 ${step.active ? 'bg-primary' : 'bg-accent-green'}`} />
              <div>
                <div className={`text-sm font-medium ${step.active ? 'text-white' : 'text-text-secondary'}`}>{step.label}</div>
                <div className={`text-xs ${step.active ? 'text-text-secondary' : 'text-[#517d66]'}`}>{step.items}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

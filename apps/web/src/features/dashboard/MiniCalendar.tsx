const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dates = [23, 24, 25, 26, 27, 28, 29];
const today = 26;

export function MiniCalendar() {
  return (
    <div className="bg-surface-dark rounded-xl border border-border-dark p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold text-base">Schedule</h3>
        <span className="text-xs font-mono text-text-secondary">OCT 2023</span>
      </div>
      <div className="flex justify-between text-center mb-2 text-xs text-text-secondary">
        {days.map((d, i) => (
          <div key={d} className={`w-8 ${dates[i] === today ? 'text-white font-bold' : ''}`}>{d}</div>
        ))}
      </div>
      <div className="flex justify-between text-center text-sm font-medium text-white">
        {dates.map((d) => (
          <div
            key={d}
            className={`w-8 py-1 rounded ${
              d === today
                ? 'bg-primary text-background-dark font-bold'
                : 'hover:bg-accent-green'
            } ${d === 27 ? 'relative' : ''}`}
          >
            {d}
            {d === 27 && (
              <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-border-dark">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-primary" />
          <div>
            <p className="text-sm text-white font-medium">Costco Trip</p>
            <p className="text-xs text-text-secondary">Tomorrow &bull; 5:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}

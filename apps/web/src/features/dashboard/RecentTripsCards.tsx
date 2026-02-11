import { useTripsStore } from '@/store/trips-store';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/hooks/useCurrency';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function RecentTripsCards() {
  const trips = useTripsStore((s) => s.trips);
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const recentTrips = [...trips]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  if (recentTrips.length === 0) {
    return (
      <section>
        <h3 className="text-text font-bold text-lg mb-4">Recent Trips</h3>
        <div className="bg-surface rounded-xl border border-border p-8 flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-3xl text-text-muted/30 mb-2">local_mall</span>
          <p className="text-text-muted text-sm">No shopping trips yet</p>
          <p className="text-text-muted/60 text-xs mt-1">Complete a shopping session to see trip summaries here.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text font-bold text-lg">Recent Trips</h3>
        <button
          onClick={() => navigate('/history')}
          className="text-text-muted text-sm hover:text-text transition-colors"
        >
          View All
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {recentTrips.map((trip) => (
          <div
            key={trip.id}
            className="bg-surface rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all group"
          >
            {/* Store header */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-[20px]">store</span>
              </div>
              <div className="min-w-0">
                <p className="text-text font-semibold text-sm truncate">{trip.storeName}</p>
                <p className="text-text-muted text-xs">{formatDate(trip.date)}</p>
              </div>
            </div>
            {/* Stats */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-text font-mono">{formatPrice(trip.totalSpent)}</p>
                <p className="text-text-muted text-xs">{trip.itemCount} items</p>
              </div>
              {trip.totalSaved > 0 && (
                <div className="text-right">
                  <span className="text-primary text-sm font-bold">-{formatPrice(trip.totalSaved)}</span>
                  <p className="text-text-muted text-[10px]">saved</p>
                </div>
              )}
            </div>
            {/* Actions */}
            <div className="px-4 pb-3 flex gap-2">
              <button
                onClick={() => navigate(`/briefing/${trip.id}`)}
                className="flex-1 text-xs font-medium py-2 rounded-lg border border-border text-text-muted hover:text-text hover:border-primary/50 transition-colors"
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

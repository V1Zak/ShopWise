import { useTripsStore } from '@/store/trips-store';
import { TripRow } from './TripRow';
import { TripExpandedDetail } from './TripExpandedDetail';

export function HistoryTable() {
  const getFilteredTrips = useTripsStore((s) => s.getFilteredTrips);
  const expandedTripId = useTripsStore((s) => s.expandedTripId);
  const trips = getFilteredTrips();

  return (
    <div className="w-full rounded-xl border border-border-dark overflow-hidden bg-surface-dark shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-dark bg-[#1a362b]">
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Date</th>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Store</th>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">Items</th>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Total Spent</th>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Savings</th>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-border-dark">
            {trips.map((trip) => (
              <>
                <TripRow key={trip.id} trip={trip} isExpanded={expandedTripId === trip.id} />
                {expandedTripId === trip.id && <TripExpandedDetail key={`${trip.id}-detail`} trip={trip} />}
              </>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#1a362b] border-t border-border-dark">
        <div className="text-sm text-slate-400">
          Showing <span className="font-medium text-white">1</span> to <span className="font-medium text-white">{trips.length}</span> of <span className="font-medium text-white">42</span> results
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm rounded-md bg-accent-green text-slate-400 cursor-not-allowed opacity-50">Previous</button>
          <button className="px-3 py-1 text-sm rounded-md bg-accent-green text-white hover:bg-primary hover:text-background-dark transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
}

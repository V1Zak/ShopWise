import { useState } from 'react';
import { useTripsStore } from '@/store/trips-store';
import { TripRow } from './TripRow';
import { TripExpandedDetail } from './TripExpandedDetail';

const PAGE_SIZE = 10;

export function HistoryTable() {
  const getFilteredTrips = useTripsStore((s) => s.getFilteredTrips);
  const expandedTripId = useTripsStore((s) => s.expandedTripId);
  const trips = getFilteredTrips();
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(trips.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, trips.length);
  const pageTrips = trips.slice(start, end);

  const isFirstPage = page === 0;
  const isLastPage = page >= totalPages - 1;

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
            {pageTrips.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-text-secondary/40">receipt_long</span>
                    <p className="text-text-secondary font-medium">No shopping trips yet</p>
                    <p className="text-text-secondary/70 text-xs max-w-xs">Complete your first shopping trip to start tracking your purchase history and savings.</p>
                  </div>
                </td>
              </tr>
            ) : (
              pageTrips.map((trip) => (
                <>
                  <TripRow key={trip.id} trip={trip} isExpanded={expandedTripId === trip.id} />
                  {expandedTripId === trip.id && <TripExpandedDetail key={`${trip.id}-detail`} trip={trip} />}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#1a362b] border-t border-border-dark">
        <div className="text-sm text-slate-400">
          Showing <span className="font-medium text-white">{trips.length === 0 ? 0 : start + 1}</span> to <span className="font-medium text-white">{end}</span> of <span className="font-medium text-white">{trips.length}</span> results
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={isFirstPage}
            className={`px-3 py-1 text-sm rounded-md bg-accent-green transition-colors ${
              isFirstPage
                ? 'text-slate-400 cursor-not-allowed opacity-50'
                : 'text-white hover:bg-primary hover:text-background-dark'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={isLastPage}
            className={`px-3 py-1 text-sm rounded-md bg-accent-green transition-colors ${
              isLastPage
                ? 'text-slate-400 cursor-not-allowed opacity-50'
                : 'text-white hover:bg-primary hover:text-background-dark'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

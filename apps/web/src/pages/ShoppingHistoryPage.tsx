import { useEffect, useCallback } from 'react';
import { HistoryStats } from '@/features/history/HistoryStats';
import { HistoryFilters } from '@/features/history/HistoryFilters';
import { HistoryTable } from '@/features/history/HistoryTable';
import { useTripsStore } from '@/store/trips-store';
import { exportTripsToCSV } from '@/utils/export';

export function ShoppingHistoryPage() {
  const fetchTrips = useTripsStore((s) => s.fetchTrips);
  const getFilteredTrips = useTripsStore((s) => s.getFilteredTrips);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleExportCSV = useCallback(() => {
    const trips = getFilteredTrips();
    exportTripsToCSV(trips);
  }, [getFilteredTrips]);

  return (
    <div className="p-6 md:p-8 lg:px-16">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-black leading-tight tracking-tight text-text">Shopping Audit Log</h1>
              <p className="text-text-muted text-base">Chronological history of your procurement sessions.</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-active text-text text-sm font-medium hover:bg-surface-active/80 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export CSV
            </button>
          </div>
          <HistoryStats />
        </div>
        <HistoryFilters />
        <HistoryTable />
      </div>
    </div>
  );
}

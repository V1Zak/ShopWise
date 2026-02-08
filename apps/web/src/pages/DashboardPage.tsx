import { useEffect } from 'react';
import { DashboardStats } from '@/features/dashboard/DashboardStats';
import { ActiveListWidget } from '@/features/dashboard/ActiveListWidget';
import { RecentActivityFeed } from '@/features/dashboard/RecentActivityFeed';
import { AttentionNeeded } from '@/features/dashboard/AttentionNeeded';
import { SmartSuggestions } from '@/features/dashboard/SmartSuggestions';
import { MiniCalendar } from '@/features/dashboard/MiniCalendar';
import { useListsStore } from '@/store/lists-store';
import { useTripsStore } from '@/store/trips-store';

export function DashboardPage() {
  const fetchLists = useListsStore((s) => s.fetchLists);
  const listsLoaded = useListsStore((s) => s.lists.length > 0);
  const fetchTrips = useTripsStore((s) => s.fetchTrips);
  const tripsLoaded = useTripsStore((s) => s.trips.length > 0);

  useEffect(() => {
    if (!listsLoaded) fetchLists();
  }, [fetchLists, listsLoaded]);

  useEffect(() => {
    if (!tripsLoaded) fetchTrips();
  }, [fetchTrips, tripsLoaded]);

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
        <DashboardStats />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <ActiveListWidget />
            <RecentActivityFeed />
          </div>
          <div className="flex flex-col gap-6">
            <AttentionNeeded />
            <SmartSuggestions />
            <MiniCalendar />
          </div>
        </div>
      </div>
    </div>
  );
}

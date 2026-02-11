import { useEffect, useRef, useState } from 'react';
import { DashboardStats } from '@/features/dashboard/DashboardStats';
import { ActiveListWidget } from '@/features/dashboard/ActiveListWidget';
import { QuickAddCarousel } from '@/features/dashboard/QuickAddCarousel';
import { RecentTripsCards } from '@/features/dashboard/RecentTripsCards';
import { RecentActivityFeed } from '@/features/dashboard/RecentActivityFeed';
import { AttentionNeeded } from '@/features/dashboard/AttentionNeeded';
import { SmartSuggestions } from '@/features/dashboard/SmartSuggestions';
import { MiniCalendar } from '@/features/dashboard/MiniCalendar';
import { TemplatePickerModal } from '@/components/TemplatePickerModal';
import { NewListDialog } from '@/components/NewListDialog';
import { NotificationPrompt } from '@/components/NotificationPrompt';
import { Icon } from '@/components/ui/Icon';
import { useListsStore } from '@/store/lists-store';
import { useTripsStore } from '@/store/trips-store';
import { useAuthStore } from '@/store/auth-store';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDateString(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function DashboardPage() {
  const fetchLists = useListsStore((s) => s.fetchLists);
  const fetchTrips = useTripsStore((s) => s.fetchTrips);
  const user = useAuthStore((s) => s.user);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [showNewList, setShowNewList] = useState(false);
  const hasFetchedLists = useRef(false);
  const hasFetchedTrips = useRef(false);

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  useEffect(() => {
    if (!hasFetchedLists.current) {
      hasFetchedLists.current = true;
      fetchLists();
    }
  }, [fetchLists]);

  useEffect(() => {
    if (!hasFetchedTrips.current) {
      hasFetchedTrips.current = true;
      fetchTrips();
    }
  }, [fetchTrips]);

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
        {/* Personalized greeting */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-text-muted text-sm">{getDateString()}</p>
            <h1 className="text-text text-2xl sm:text-3xl font-bold mt-1">
              {getGreeting()}, {firstName}
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setTemplateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-text text-sm font-medium hover:border-primary/50 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span className="hidden sm:inline">Template</span>
            </button>
            <button onClick={() => setShowNewList(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-text-inv px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-[0_0_15px_rgba(var(--color-primary)/0.3)]">
              <Icon name="add" size={18} />
              New List
            </button>
          </div>
        </div>

        <NotificationPrompt />
        <DashboardStats />
        <QuickAddCarousel />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <ActiveListWidget />
            <RecentTripsCards />
            <RecentActivityFeed />
          </div>
          <div className="flex flex-col gap-6">
            <AttentionNeeded />
            <SmartSuggestions />
            <MiniCalendar />
          </div>
        </div>
      </div>
      <TemplatePickerModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
      />
      <NewListDialog open={showNewList} onClose={() => setShowNewList(false)} />
    </div>
  );
}

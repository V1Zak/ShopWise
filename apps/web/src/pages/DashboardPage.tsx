import { useEffect, useState } from 'react';
import { DashboardStats } from '@/features/dashboard/DashboardStats';
import { ActiveListWidget } from '@/features/dashboard/ActiveListWidget';
import { RecentActivityFeed } from '@/features/dashboard/RecentActivityFeed';
import { AttentionNeeded } from '@/features/dashboard/AttentionNeeded';
import { SmartSuggestions } from '@/features/dashboard/SmartSuggestions';
import { MiniCalendar } from '@/features/dashboard/MiniCalendar';
import { NewListDialog } from '@/components/NewListDialog';
import { NotificationPrompt } from '@/components/NotificationPrompt';
import { Icon } from '@/components/ui/Icon';
import { useListsStore } from '@/store/lists-store';

export function DashboardPage() {
  const fetchLists = useListsStore((s) => s.fetchLists);
  const [showNewList, setShowNewList] = useState(false);

  useEffect(() => { fetchLists(); }, [fetchLists]);

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">Dashboard</h1>
            <p className="text-text-secondary text-sm mt-0.5">Your shopping overview</p>
          </div>
          <button onClick={() => setShowNewList(true)}
            className="flex items-center gap-2 bg-primary hover:bg-emerald-400 text-background-dark px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-[0_0_15px_rgba(19,236,128,0.3)]">
            <Icon name="add" size={18} />
            New List
          </button>
        </div>
        <NotificationPrompt />
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
      <NewListDialog open={showNewList} onClose={() => setShowNewList(false)} />
    </div>
  );
}

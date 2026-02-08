import { useEffect, useState } from 'react';
import { DashboardStats } from '@/features/dashboard/DashboardStats';
import { ActiveListWidget } from '@/features/dashboard/ActiveListWidget';
import { RecentActivityFeed } from '@/features/dashboard/RecentActivityFeed';
import { AttentionNeeded } from '@/features/dashboard/AttentionNeeded';
import { SmartSuggestions } from '@/features/dashboard/SmartSuggestions';
import { MiniCalendar } from '@/features/dashboard/MiniCalendar';
import { TemplatePickerModal } from '@/components/TemplatePickerModal';
import { useListsStore } from '@/store/lists-store';

export function DashboardPage() {
  const fetchLists = useListsStore((s) => s.fetchLists);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <DashboardStats />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTemplateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-green text-white text-sm font-medium hover:bg-[#2d5c45] transition-colors border border-border-dark"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              Create from Template
            </button>
          </div>
        </div>
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
      <TemplatePickerModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
      />
    </div>
  );
}

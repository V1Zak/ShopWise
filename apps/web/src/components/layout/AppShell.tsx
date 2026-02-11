import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useListsStore } from '@/store/lists-store';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

export function AppShell() {
  useRealtimeNotifications();
  const fetchLists = useListsStore((s) => s.fetchLists);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <TopBar />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
        <BottomNav />
      </main>
    </div>
  );
}

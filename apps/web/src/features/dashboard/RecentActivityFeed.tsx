import { useMemo, useState } from 'react';
import { useListsStore } from '@/store/lists-store';
import { useTripsStore } from '@/store/trips-store';

const COLLAPSED_COUNT = 6;

interface ActivityItem {
  id: string;
  type: 'purchase' | 'add' | 'alert';
  icon: string;
  iconBg: string;
  iconColor: string;
  text: string;
  boldText: string;
  time: string;
  detail?: string;
  price?: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function RecentActivityFeed() {
  const lists = useListsStore((s) => s.lists);
  const items = useListsStore((s) => s.items);
  const trips = useTripsStore((s) => s.trips);
  const [expanded, setExpanded] = useState(false);

  const activity = useMemo<ActivityItem[]>(() => {
    const result: ActivityItem[] = [];

    // Recent list creations
    for (const list of lists) {
      result.push({
        id: `list-${list.id}`,
        type: 'add',
        icon: 'playlist_add',
        iconBg: 'bg-primary/20',
        iconColor: 'text-primary',
        text: 'Created list',
        boldText: list.title,
        time: list.createdAt,
        detail: `${list.itemCount} items`,
      });
    }

    // Recent item additions (show last few added items based on sort order)
    const recentItems = [...items]
      .sort((a, b) => b.sortOrder - a.sortOrder)
      .slice(0, 5);
    for (const item of recentItems) {
      const parentList = lists.find((l) => l.id === item.listId);
      result.push({
        id: `item-${item.id}`,
        type: 'add',
        icon: 'add_task',
        iconBg: 'bg-primary/20',
        iconColor: 'text-primary',
        text: 'Added',
        boldText: item.name,
        time: parentList?.updatedAt ?? parentList?.createdAt ?? '',
        detail: parentList ? `to '${parentList.title}'` : undefined,
      });
    }

    // Completed trips
    for (const trip of trips) {
      result.push({
        id: `trip-${trip.id}`,
        type: 'purchase',
        icon: 'shopping_bag',
        iconBg: 'bg-blue-500/20',
        iconColor: 'text-blue-400',
        text: 'Shopped at',
        boldText: trip.storeName,
        time: trip.date,
        price: `$${trip.totalSpent.toFixed(2)}`,
        detail: `${trip.itemCount} items`,
      });
    }

    // Sort by time descending
    result.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
    );
    return result;
  }, [lists, items, trips]);

  const visibleActivity = expanded ? activity : activity.slice(0, COLLAPSED_COUNT);
  const hasMore = activity.length > COLLAPSED_COUNT;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text font-bold text-lg">Recent Activity</h3>
        {hasMore && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-text-muted text-sm hover:text-text transition-colors"
          >
            {expanded ? 'Show Less' : 'View All'}
          </button>
        )}
      </div>
      <div className="bg-surface rounded-xl border border-border p-1">
        {activity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-text-muted">
            <span className="material-symbols-outlined text-[32px] mb-2">
              history
            </span>
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visibleActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 hover:bg-surface-active/30 transition-colors rounded-lg"
              >
                <div
                  className={`${item.iconBg} ${item.iconColor} p-2 rounded-lg mt-0.5`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {item.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text">
                    {item.text}{' '}
                    <span className="font-bold text-text">
                      {item.boldText}
                    </span>
                    {item.detail && (
                      <span className="text-text-muted">
                        {' '}
                        {item.detail}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="text-text-muted">
                      {timeAgo(item.time)}
                    </span>
                    {item.price && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-text-muted" />
                        <span className="font-mono text-text">
                          {item.price}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

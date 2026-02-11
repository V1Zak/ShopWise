import { useMemo } from 'react';
import { useListsStore } from '@/store/lists-store';
import { useTripsStore } from '@/store/trips-store';

interface Alert {
  color: string;
  title: string;
  sub: string;
}

const STALE_DAYS = 14; // Lists not updated in 14+ days are flagged

export function AttentionNeeded() {
  const lists = useListsStore((s) => s.lists);
  const trips = useTripsStore((s) => s.trips);

  const alerts = useMemo<Alert[]>(() => {
    const result: Alert[] = [];
    const now = Date.now();

    // Flag lists that haven't been updated in a while
    for (const list of lists) {
      if (list.isTemplate) continue;
      const updatedAt = new Date(list.updatedAt).getTime();
      const daysSince = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));
      if (daysSince >= STALE_DAYS) {
        result.push({
          color: 'bg-yellow-500',
          title: `"${list.title}" is stale`,
          sub: `Not updated in ${daysSince} days`,
        });
      }
    }

    // Flag trips from the last week that have warnings in their insights
    const recentTrips = trips.filter((t) => {
      const tripDate = new Date(t.date).getTime();
      const daysSince = Math.floor((now - tripDate) / (1000 * 60 * 60 * 24));
      return daysSince <= 7;
    });

    for (const trip of recentTrips) {
      const warnings = trip.insights.filter((i) => i.type === 'warning');
      for (const warning of warnings) {
        result.push({
          color: 'bg-red-500',
          title: warning.title,
          sub: `${trip.storeName} - ${warning.description}`,
        });
      }
    }

    // Flag large lists that may need attention
    for (const list of lists) {
      if (list.isTemplate) continue;
      if (list.itemCount > 10 && list.estimatedTotal > 100) {
        result.push({
          color: 'bg-blue-500',
          title: `Large list: "${list.title}"`,
          sub: `${list.itemCount} items, ~$${list.estimatedTotal.toFixed(0)} estimated`,
        });
      }
    }

    return result.slice(0, 5);
  }, [lists, trips]);

  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h3 className="text-text font-bold text-base mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-yellow-400">
          warning
        </span>
        Attention Needed
      </h3>
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-text-muted">
          <span className="material-symbols-outlined text-[28px] mb-2 text-primary">
            check_circle
          </span>
          <p className="text-sm text-primary font-medium">All clear!</p>
          <p className="text-xs text-text-muted mt-1">
            No issues need your attention
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-bg p-3 rounded-lg border border-border/50"
            >
              <div
                className={`h-2 w-2 rounded-full ${alert.color} mt-1.5 flex-shrink-0`}
              />
              <div>
                <p className="text-sm text-text font-medium">{alert.title}</p>
                <p className="text-xs text-text-muted">{alert.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useMemo } from 'react';
import { useTripsStore } from '@/store/trips-store';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDates(today: Date): Date[] {
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push(d);
  }
  return week;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function MiniCalendar() {
  const trips = useTripsStore((s) => s.trips);

  const today = useMemo(() => new Date(), []);
  const weekDates = useMemo(() => getWeekDates(today), [today]);

  const tripDateSet = useMemo(() => {
    const set = new Set<string>();
    for (const trip of trips) {
      set.add(toDateKey(new Date(trip.date)));
    }
    return set;
  }, [trips]);

  const nextTrip = useMemo(() => {
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    ).getTime();
    return (
      [...trips]
        .filter((t) => new Date(t.date).getTime() >= todayStart)
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )[0] ?? null
    );
  }, [trips, today]);

  const monthYear = today
    .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    .toUpperCase();

  function hasTrip(date: Date): boolean {
    return tripDateSet.has(toDateKey(date));
  }

  function formatNextTripDate(tripDate: string): string {
    const d = new Date(tripDate);
    if (isSameDay(d, today)) return 'Today';
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (isSameDay(d, tomorrow)) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-text font-bold text-base">Schedule</h3>
        <span className="text-xs font-mono text-text-muted">
          {monthYear}
        </span>
      </div>
      <div className="flex justify-between text-center mb-2 text-xs text-text-muted">
        {DAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={`w-8 ${isSameDay(weekDates[i], today) ? 'text-text font-bold' : ''}`}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-center text-sm font-medium text-text">
        {weekDates.map((date) => {
          const isToday = isSameDay(date, today);
          const dateHasTrip = hasTrip(date);
          return (
            <div
              key={date.toISOString()}
              className={`w-8 py-1 rounded ${
                isToday
                  ? 'bg-primary text-text-inv font-bold'
                  : 'hover:bg-surface-active'
              } ${dateHasTrip && !isToday ? 'relative' : ''}`}
            >
              {date.getDate()}
              {dateHasTrip && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-border">
        {nextTrip ? (
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full bg-primary" />
            <div>
              <p className="text-sm text-text font-medium">
                {nextTrip.storeName} Trip
              </p>
              <p className="text-xs text-text-muted">
                {formatNextTripDate(nextTrip.date)} &bull;{' '}
                {nextTrip.itemCount} items
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-text-muted text-center">
            No upcoming trips
          </p>
        )}
      </div>
    </div>
  );
}

import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useTripsStore } from '@/store/trips-store';
import type { ShoppingTrip } from '@shopwise/shared';

interface Props {
  trip: ShoppingTrip;
}

export function BriefingKPIs({ trip }: Props) {
  const trips = useTripsStore((s) => s.trips);

  // Compute 30-day average from other trips for comparison
  const otherTrips = trips.filter((t) => t.id !== trip.id);
  const avgSpent = otherTrips.length > 0
    ? otherTrips.reduce((s, t) => s + t.totalSpent, 0) / otherTrips.length
    : 0;
  const spentTrend = avgSpent > 0
    ? ((trip.totalSpent - avgSpent) / avgSpent) * 100
    : 0;

  const savingsRate = trip.totalSpent > 0
    ? (trip.totalSaved / trip.totalSpent) * 100
    : 0;

  const efficiency = trip.efficiencyScore ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        label="Total Spent"
        value={`$${trip.totalSpent.toFixed(2)}`}
        trend={-Math.round(spentTrend * 10) / 10}
        trendLabel={`${Math.abs(Math.round(spentTrend * 10) / 10)}%`}
        icon="payments"
        iconColor="text-text"
      >
        <p className="text-text-muted text-xs mt-1">
          {avgSpent > 0
            ? `vs. $${avgSpent.toFixed(2)} average across ${otherTrips.length} trip${otherTrips.length !== 1 ? 's' : ''}`
            : 'First trip — no comparison data yet'}
        </p>
      </StatCard>
      <StatCard
        label="Total Saved"
        value={`$${trip.totalSaved.toFixed(2)}`}
        trend={savingsRate}
        trendLabel={`${Math.round(savingsRate)}%`}
        icon="savings"
        highlight={savingsRate > 10}
      >
        <p className={`${savingsRate > 10 ? 'text-primary/70' : 'text-text-muted'} text-xs mt-1`}>
          {savingsRate > 10
            ? 'Great savings on this trip!'
            : savingsRate > 0
              ? 'Some savings found.'
              : 'No savings recorded for this trip.'}
        </p>
      </StatCard>
      <StatCard
        label="Efficiency Score"
        value={`${efficiency}/100`}
        trend={efficiency > 80 ? efficiency - 80 : -(80 - efficiency)}
        trendLabel={efficiency > 80 ? `+${efficiency - 80} pts` : `${efficiency - 80} pts`}
        icon="speed"
        iconColor="text-text"
      >
        <ProgressBar value={efficiency} className="mt-2" />
      </StatCard>
    </div>
  );
}

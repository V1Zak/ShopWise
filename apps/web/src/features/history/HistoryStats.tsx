import { StatCard } from '@/components/ui/StatCard';
import { useTripsStore } from '@/store/trips-store';
import { useCurrency } from '@/hooks/useCurrency';

export function HistoryStats() {
  const getFilteredTrips = useTripsStore((s) => s.getFilteredTrips);
  const trips = getFilteredTrips();
  const { formatPrice } = useCurrency();

  const totalSpent = trips.reduce((sum, t) => sum + t.totalSpent, 0);
  const totalSavings = trips.reduce((sum, t) => sum + (t.totalSaved ?? 0), 0);
  const avgSavingsRate = totalSpent > 0 ? (totalSavings / totalSpent) * 100 : 0;

  // Find top store by visit count
  const storeCounts: Record<string, { name: string; count: number }> = {};
  for (const t of trips) {
    if (!storeCounts[t.storeId]) storeCounts[t.storeId] = { name: t.storeName, count: 0 };
    storeCounts[t.storeId].count++;
  }
  const topStore = Object.values(storeCounts).sort((a, b) => b.count - a.count)[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        label="Total Spend YTD"
        value={formatPrice(totalSpent)}
        icon="payments"
        iconColor="text-text"
      />
      <StatCard
        label="Avg Savings"
        value={`${avgSavingsRate.toFixed(1)}%`}
        icon="savings"
        iconColor="text-text"
      />
      <StatCard
        label="Top Source"
        value={topStore ? topStore.name : 'N/A'}
        trendLabel={topStore ? `${topStore.count} visits` : undefined}
        icon="storefront"
        iconColor="text-text"
      />
    </div>
  );
}

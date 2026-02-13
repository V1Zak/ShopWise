import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useListsStore } from '@/store/lists-store';
import { useProductsStore } from '@/store/products-store';
import { useTripsStore } from '@/store/trips-store';
import { useCurrency } from '@/hooks/useCurrency';

export function DashboardStats() {
  const lists = useListsStore((s) => s.lists).filter((l) => !l.isTemplate);
  const items = useListsStore((s) => s.items);
  const products = useProductsStore((s) => s.products);
  const trips = useTripsStore((s) => s.trips);

  // Compute real values
  const totalItems = lists.reduce((sum, l) => sum + (l.itemCount ?? 0), 0);
  const totalEstimated = items.reduce((sum, item) => sum + (item.estimatedPrice ?? 0) * (item.quantity || 1), 0);
  const totalBudget = lists.reduce((sum, l) => sum + (l.budget ?? 0), 0);
  const hasBudget = totalBudget > 0;
  const budgetUsed = hasBudget ? Math.round((totalEstimated / totalBudget) * 100) : 0;

  const totalSpent = trips.reduce((sum, t) => sum + t.totalSpent, 0);
  const productCount = products.length;
  const { formatPrice } = useCurrency();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        label={hasBudget ? 'Monthly Budget' : 'Estimated Total'}
        value={hasBudget ? formatPrice(totalBudget) : formatPrice(totalEstimated)}
        icon="account_balance_wallet"
      >
        {hasBudget ? (
          <>
            <ProgressBar value={Math.min(budgetUsed, 100)} className="mb-2" />
            <p className="text-xs text-text-muted text-right">{budgetUsed}% used</p>
          </>
        ) : (
          <p className="text-xs text-text-muted">{totalItems} items across {lists.length} {lists.length === 1 ? 'list' : 'lists'}</p>
        )}
      </StatCard>

      <StatCard label="Total Spent" value={formatPrice(totalSpent)} icon="trending_up" iconColor="text-blue-400">
        <p className="text-xs text-text-muted">
          {trips.length} shopping {trips.length === 1 ? 'trip' : 'trips'} recorded
        </p>
      </StatCard>

      <StatCard label="Items Tracked" value={String(totalItems)} icon="inventory" iconColor="text-purple-400">
        <p className="text-xs text-text-muted">
          {productCount} {productCount === 1 ? 'product' : 'products'} in catalog
        </p>
      </StatCard>
    </div>
  );
}

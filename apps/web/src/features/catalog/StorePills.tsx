import { useEffect } from 'react';
import { useProductsStore } from '@/store/products-store';
import { useStoresStore } from '@/store/stores-store';
import { FilterChip } from '@/components/ui/FilterChip';

export function StorePills() {
  const activeStoreId = useProductsStore((s) => s.activeStoreId);
  const setStore = useProductsStore((s) => s.setStore);
  const stores = useStoresStore((s) => s.stores);
  const fetchStores = useStoresStore((s) => s.fetchStores);

  useEffect(() => {
    if (stores.length === 0) fetchStores();
  }, [stores.length, fetchStores]);

  if (stores.length === 0) return null;

  return (
    <div className="px-6 lg:px-10 py-3 flex gap-2 overflow-x-auto border-b border-border-dark">
      <FilterChip
        label="All Stores"
        active={activeStoreId === 'all'}
        onClick={() => setStore('all')}
      />
      {stores.map((store) => (
        <FilterChip
          key={store.id}
          label={store.name}
          active={activeStoreId === store.id}
          onClick={() => setStore(store.id)}
        />
      ))}
    </div>
  );
}

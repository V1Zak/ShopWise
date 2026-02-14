import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ListHeader } from '@/features/shopping-list/ListHeader';
import { ListTabs } from '@/features/shopping-list/ListTabs';
import { ShoppingListContent } from '@/features/shopping-list/ShoppingListContent';
import { CompleteButton } from '@/features/shopping-list/CompleteButton';
import { StoreComparisonTable } from '@/features/shopping-list/StoreComparisonTable';
import { AisleNavigation } from '@/features/shopping-list/AisleNavigation';
import { ProductIntelligence } from '@/features/shopping-list/ProductIntelligence';
import { BudgetHealth } from '@/features/shopping-list/BudgetHealth';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { ScanResultBanner } from '@/components/ScanResultBanner';
import { AddProductForm } from '@/components/AddProductForm';
import { useListsStore } from '@/store/lists-store';
import { useRealtimeList } from '@/hooks/useRealtimeList';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import type { ListItem, ListItemStatus, Product } from '@shopwise/shared';

export function ActiveShoppingListPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<ListItemStatus>('to_buy');
  const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);
  const selectedItemRef = useRef<ListItem | null>(null);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const activeListId = useListsStore((s) => s.activeListId);
  const setActiveList = useListsStore((s) => s.setActiveList);
  const fetchListItems = useListsStore((s) => s.fetchListItems);
  const getActiveList = useListsStore((s) => s.getActiveList);
  const setListBudget = useListsStore((s) => s.setListBudget);

  const validId = id && id.length === 36 ? id : undefined;
  const listId = validId || activeListId;

  useEffect(() => {
    if (listId) {
      setActiveList(listId);
      fetchListItems(listId);
    }
  }, [listId, setActiveList, fetchListItems]);

  useRealtimeList(listId);
  const items = useListsStore((s) => s.items);
  const getItemsByStatus = useListsStore((s) => s.getItemsByStatus);
  const getItemsForList = useListsStore((s) => s.getItemsForList);
  const addItem = useListsStore((s) => s.addItem);
  const { isOpen, openScanner, closeScanner, handleScan, scannedProduct, notFound, lastBarcode, clearResult } = useBarcodeScanner();

  const activeList = getActiveList();
  const allItems = getItemsForList(activeListId);
  const toBuy = getItemsByStatus(activeListId, 'to_buy');
  const inCart = getItemsByStatus(activeListId, 'in_cart');
  const skipped = getItemsByStatus(activeListId, 'skipped');

  // All items for the active list (for AisleNavigation)
  const listItems = items.filter((i) => i.listId === activeListId);

  // Keep selectedItem in sync with store (e.g., after status toggle or price update)
  useEffect(() => {
    const currentId = selectedItemRef.current?.id;
    if (!currentId) return;

    const updated = items.find((i) => i.id === currentId);
    if (!updated) {
      selectedItemRef.current = null;
      setSelectedItem(null);
      return;
    }

    const prev = selectedItemRef.current;
    if (
      prev &&
      prev.status === updated.status &&
      prev.actualPrice === updated.actualPrice &&
      prev.quantity === updated.quantity &&
      prev.name === updated.name
    ) {
      return;
    }

    selectedItemRef.current = updated;
    setSelectedItem(updated);
  }, [items]);

  const handleSelectItem = (item: ListItem) => {
    const next = selectedItemRef.current?.id === item.id ? null : item;
    selectedItemRef.current = next;
    setSelectedItem(next);
  };

  const handleAddScannedProduct = (product: Product) => {
    addItem({
      id: `temp-${Date.now()}`,
      listId: activeListId,
      productId: product.id,
      name: product.name,
      categoryId: product.categoryId,
      quantity: 1,
      unit: product.unit,
      estimatedPrice: product.averagePrice,
      status: 'to_buy',
      sortOrder: toBuy.length + 1,
    });
    clearResult();
  };

  const handleSetBudget = (budget: number | null) => {
    if (activeListId) {
      setListBudget(activeListId, budget);
    }
  };

  const handleProductCreated = (product: Product) => {
    setShowAddProductForm(false);
    handleAddScannedProduct(product);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {isOpen && <BarcodeScanner onScan={handleScan} onClose={closeScanner} />}
      {showAddProductForm && lastBarcode && (
        <AddProductForm
          barcode={lastBarcode}
          onProductCreated={handleProductCreated}
          onClose={() => setShowAddProductForm(false)}
        />
      )}

      <section className="flex-1 flex flex-col h-full border-r border-border bg-bg min-w-0 overflow-hidden">
        <ListHeader onScanClick={openScanner} />
        <ScanResultBanner
          product={scannedProduct}
          notFound={notFound}
          barcode={lastBarcode}
          onAddToList={handleAddScannedProduct}
          onAddNewProduct={() => setShowAddProductForm(true)}
          onDismiss={clearResult}
        />
        <ListTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={{ to_buy: toBuy.length, in_cart: inCart.length, skipped: skipped.length }}
        />
        <ShoppingListContent
          activeTab={activeTab}
          selectedItemId={selectedItem?.id ?? null}
          onSelectItem={handleSelectItem}
        />
        <CompleteButton />
      </section>

      <section className="w-[450px] hidden xl:flex flex-col bg-surface-alt border-l border-border">
        <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
          <StoreComparisonTable />
          <AisleNavigation items={listItems} />
          <ProductIntelligence selectedItem={selectedItem} />
          <BudgetHealth
            budget={activeList?.budget}
            items={allItems}
            onSetBudget={handleSetBudget}
          />
        </div>
      </section>
    </div>
  );
}

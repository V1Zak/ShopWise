import { create } from 'zustand';
import type { ShoppingList, ListItem, ListItemStatus } from '@shopwise/shared';
import { listsService } from '@/services/lists.service';

interface ListsState {
  lists: ShoppingList[];
  activeListId: string;
  items: ListItem[];
  isLoading: boolean;
  fetchLists: () => Promise<void>;
  fetchListItems: (listId: string) => Promise<void>;
  createList: (list: { title: string; storeId?: string }) => Promise<string>;
  setActiveList: (id: string) => void;
  getActiveList: () => ShoppingList | undefined;
  getItemsForList: (listId: string) => ListItem[];
  getItemsByStatus: (listId: string, status: ListItemStatus) => ListItem[];
  toggleItemStatus: (itemId: string) => void;
  updateItemPrice: (itemId: string, price: number) => void;
  addItem: (item: ListItem) => void;
  getRunningTotal: (listId: string) => number;
}

export const useListsStore = create<ListsState>((set, get) => ({
  lists: [],
  activeListId: '',
  items: [],
  isLoading: false,

  fetchLists: async () => {
    set({ isLoading: true });
    try {
      const lists = await listsService.getLists();
      set({ lists, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createList: async (list) => {
    const row = await listsService.createList(list);
    await get().fetchLists();
    return row.id;
  },

  fetchListItems: async (listId) => {
    set({ isLoading: true });
    try {
      const items = await listsService.getListItems(listId);
      set({ items, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setActiveList: (id) => set({ activeListId: id }),
  getActiveList: () => { const state = get(); return state.lists.find((l) => l.id === state.activeListId); },
  getItemsForList: (listId) => get().items.filter((i) => i.listId === listId),
  getItemsByStatus: (listId, status) => get().items.filter((i) => i.listId === listId && i.status === status),

  toggleItemStatus: (itemId) => {
    const item = get().items.find((i) => i.id === itemId);
    if (!item) return;
    const newStatus = item.status === 'to_buy' ? 'in_cart' : item.status === 'in_cart' ? 'to_buy' : item.status;
    const newActualPrice = item.status === 'to_buy' ? item.actualPrice ?? item.estimatedPrice : item.actualPrice;
    set((state) => ({ items: state.items.map((i) => i.id === itemId ? { ...i, status: newStatus as ListItemStatus, actualPrice: newActualPrice } : i) }));
    listsService.updateItem(itemId, { status: newStatus, actualPrice: newActualPrice ?? null }).catch(() => {
      set((state) => ({ items: state.items.map((i) => i.id === itemId ? { ...i, status: item.status, actualPrice: item.actualPrice } : i) }));
    });
  },

  updateItemPrice: (itemId, price) => {
    const item = get().items.find((i) => i.id === itemId);
    if (!item) return;
    set((state) => ({ items: state.items.map((i) => i.id === itemId ? { ...i, actualPrice: price } : i) }));
    listsService.updateItem(itemId, { actualPrice: price }).catch(() => {
      set((state) => ({ items: state.items.map((i) => i.id === itemId ? { ...i, actualPrice: item.actualPrice } : i) }));
    });
  },

  addItem: (item) => {
    const tempId = item.id;
    set((state) => ({ items: [...state.items, item] }));
    listsService.addItem({ listId: item.listId, name: item.name, categoryId: item.categoryId, quantity: item.quantity, unit: item.unit, estimatedPrice: item.estimatedPrice, productId: item.productId, tags: item.tags, sortOrder: item.sortOrder }).then((row) => {
      set((state) => ({ items: state.items.map((i) => i.id === tempId ? { ...i, id: row.id, listId: row.list_id } : i) }));
    }).catch(() => {
      set((state) => ({ items: state.items.filter((i) => i.id !== tempId) }));
    });
  },

  getRunningTotal: (listId) => {
    const items = get().items.filter((i) => i.listId === listId && i.status === 'in_cart');
    return items.reduce((sum, item) => sum + (item.actualPrice ?? item.estimatedPrice), 0);
  },
}));

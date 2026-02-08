import { create } from 'zustand';
import type { ShoppingList, ListItem, ListItemStatus } from '@shopwise/shared';
import { mockShoppingLists } from '@/data/mock-shopping-lists';
import { mockListItems } from '@/data/mock-list-items';

interface ListsState {
  lists: ShoppingList[];
  activeListId: string;
  items: ListItem[];
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
  lists: mockShoppingLists,
  activeListId: 'list2',
  items: mockListItems,

  setActiveList: (id) => set({ activeListId: id }),

  getActiveList: () => {
    const state = get();
    return state.lists.find((l) => l.id === state.activeListId);
  },

  getItemsForList: (listId) => get().items.filter((i) => i.listId === listId),

  getItemsByStatus: (listId, status) =>
    get().items.filter((i) => i.listId === listId && i.status === status),

  toggleItemStatus: (itemId) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: item.status === 'to_buy' ? 'in_cart' : item.status === 'in_cart' ? 'to_buy' : item.status,
              actualPrice: item.status === 'to_buy' ? item.actualPrice ?? item.estimatedPrice : item.actualPrice,
            }
          : item,
      ),
    })),

  updateItemPrice: (itemId, price) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, actualPrice: price } : item,
      ),
    })),

  addItem: (item) => set((state) => ({ items: [...state.items, item] })),

  getRunningTotal: (listId) => {
    const items = get().items.filter((i) => i.listId === listId && i.status === 'in_cart');
    return items.reduce((sum, item) => sum + (item.actualPrice ?? item.estimatedPrice), 0);
  },
}));

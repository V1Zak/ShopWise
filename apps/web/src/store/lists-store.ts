import { create } from 'zustand';
import type { ShoppingList, ListItem, ListItemStatus } from '@shopwise/shared';
import { listsService } from '@/services/lists.service';

interface ListsState {
  lists: ShoppingList[];
  activeListId: string;
  items: ListItem[];
  isLoading: boolean;
  templates: ShoppingList[];
  fetchLists: () => Promise<void>;
  fetchListItems: (listId: string) => Promise<void>;
  createList: (list: { title: string; storeId?: string }) => Promise<string>;
  deleteList: (listId: string) => Promise<void>;
  updateList: (listId: string, updates: { title?: string; storeId?: string }) => Promise<void>;
  setActiveList: (id: string) => void;
  getActiveList: () => ShoppingList | undefined;
  getOwnedLists: () => ShoppingList[];
  getSharedLists: () => ShoppingList[];
  getItemsForList: (listId: string) => ListItem[];
  getItemsByStatus: (listId: string, status: ListItemStatus) => ListItem[];
  toggleItemStatus: (itemId: string) => void;
  updateItemPrice: (itemId: string, price: number) => void;
  addItem: (item: ListItem) => void;
  deleteItem: (itemId: string) => void;
  updateItemName: (itemId: string, name: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  skipItem: (itemId: string) => void;
  getRunningTotal: (listId: string) => number;
  fetchTemplates: () => Promise<void>;
  saveAsTemplate: (listId: string, title: string) => Promise<void>;
  createFromTemplate: (templateId: string, newTitle: string) => Promise<ShoppingList | null>;
  setListBudget: (listId: string, budget: number | null) => void;
}

export const useListsStore = create<ListsState>((set, get) => ({
  lists: [],
  activeListId: '',
  items: [],
  isLoading: false,
  templates: [],

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

  deleteList: async (listId) => {
    const prevLists = get().lists;
    const prevActiveListId = get().activeListId;

    set((state) => ({
      lists: state.lists.filter((l) => l.id !== listId),
      activeListId: state.activeListId === listId ? '' : state.activeListId,
    }));

    try {
      await listsService.deleteList(listId);
    } catch {
      set({ lists: prevLists, activeListId: prevActiveListId });
      throw new Error('Failed to delete list');
    }
  },

  updateList: async (listId, updates) => {
    const list = get().lists.find((l) => l.id === listId);
    if (!list) return;

    const prevTitle = list.title;
    const prevStoreId = list.storeId;

    set((state) => ({
      lists: state.lists.map((l) =>
        l.id === listId
          ? { ...l, ...(updates.title !== undefined && { title: updates.title }), ...(updates.storeId !== undefined && { storeId: updates.storeId }) }
          : l,
      ),
    }));

    try {
      await listsService.updateList(listId, updates);
    } catch {
      set((state) => ({
        lists: state.lists.map((l) =>
          l.id === listId ? { ...l, title: prevTitle, storeId: prevStoreId } : l,
        ),
      }));
    }
  },

  fetchListItems: async (listId) => {
    if (!listId || listId.length !== 36) return;
    set({ isLoading: true });
    try {
      const items = await listsService.getListItems(listId);
      set({ items, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setActiveList: (id) => { if (id && id.length === 36) set({ activeListId: id }); },
  getActiveList: () => { const state = get(); return state.lists.find((l) => l.id === state.activeListId); },
  getOwnedLists: () => get().lists.filter((l) => !l.sharedPermission),
  getSharedLists: () => get().lists.filter((l) => !!l.sharedPermission),
  getItemsForList: (listId) => get().items.filter((i) => i.listId === listId),
  getItemsByStatus: (listId, status) => get().items.filter((i) => i.listId === listId && i.status === status),

  toggleItemStatus: (itemId) => {
    const item = get().items.find((i) => i.id === itemId);
    if (!item) return;
    const newStatus = item.status === 'to_buy' ? 'in_cart' : item.status === 'in_cart' ? 'to_buy' : item.status;
    const newActualPrice = item.status === 'to_buy' ? item.actualPrice ?? item.estimatedPrice : item.actualPrice;

    set((state) => ({
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, status: newStatus as ListItemStatus, actualPrice: newActualPrice } : i,
      ),
    }));

    listsService.updateItem(itemId, { status: newStatus, actualPrice: newActualPrice ?? null }).catch(() => {
      set((state) => ({
        items: state.items.map((i) => i.id === itemId ? { ...i, status: item.status, actualPrice: item.actualPrice } : i),
      }));
    });
  },

  updateItemPrice: (itemId, price) => {
    const item = get().items.find((i) => i.id === itemId);
    if (!item) return;

    set((state) => ({
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, actualPrice: price } : i,
      ),
    }));

    listsService.updateItem(itemId, { actualPrice: price }).catch(() => {
      set((state) => ({ items: state.items.map((i) => i.id === itemId ? { ...i, actualPrice: item.actualPrice } : i) }));
    });
  },

  addItem: (item) => {
    const tempId = item.id;

    set((state) => ({ items: [...state.items, item] }));

    listsService.addItem({
      listId: item.listId,
      name: item.name,
      categoryId: item.categoryId,
      quantity: item.quantity,
      unit: item.unit,
      estimatedPrice: item.estimatedPrice,
      productId: item.productId,
      tags: item.tags,
      sortOrder: item.sortOrder,
    }).then((row) => {
      set((state) => ({
        items: state.items.map((i) =>
          i.id === tempId ? { ...i, id: row.id, listId: row.list_id } : i,
        ),
      }));
    }).catch(() => {
      set((state) => ({
        items: state.items.filter((i) => i.id !== tempId),
      }));
    });
  },

  deleteItem: (itemId) => {
    const item = get().items.find((i) => i.id === itemId);
    if (!item) return;

    set((state) => ({
      items: state.items.filter((i) => i.id !== itemId),
    }));

    listsService.deleteItem(itemId).catch(() => {
      set((state) => ({
        items: [...state.items, item],
      }));
    });
  },

  updateItemName: (itemId, name) => {
    const item = get().items.find((i) => i.id === itemId);
    if (!item) return;
    const prevName = item.name;

    set((state) => ({
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, name } : i,
      ),
    }));

    listsService.updateItem(itemId, { name }).catch(() => {
      set((state) => ({
        items: state.items.map((i) =>
          i.id === itemId ? { ...i, name: prevName } : i,
        ),
      }));
    });
  },

  updateItemQuantity: (itemId, quantity) => {
    const item = get().items.find((i) => i.id === itemId);
    if (!item) return;
    const prevQuantity = item.quantity;

    set((state) => ({
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, quantity } : i,
      ),
    }));

    listsService.updateItem(itemId, { quantity }).catch(() => {
      set((state) => ({
        items: state.items.map((i) =>
          i.id === itemId ? { ...i, quantity: prevQuantity } : i,
        ),
      }));
    });
  },

  skipItem: (itemId) => {
    const item = get().items.find((i) => i.id === itemId);
    if (!item) return;
    const prevStatus = item.status;
    const newStatus: ListItemStatus = prevStatus === 'skipped' ? 'to_buy' : 'skipped';

    set((state) => ({
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, status: newStatus } : i,
      ),
    }));

    listsService.updateItem(itemId, { status: newStatus }).catch(() => {
      set((state) => ({
        items: state.items.map((i) =>
          i.id === itemId ? { ...i, status: prevStatus } : i,
        ),
      }));
    });
  },

  getRunningTotal: (listId) => {
    const items = get().items.filter((i) => i.listId === listId && i.status === 'in_cart');
    return items.reduce((sum, item) => sum + (item.actualPrice ?? item.estimatedPrice) * (item.quantity || 1), 0);
  },

  fetchTemplates: async () => {
    try {
      const templates = await listsService.getTemplates();
      set({ templates });
    } catch {
      // silently fail
    }
  },

  saveAsTemplate: async (listId, title) => {
    try {
      const template = await listsService.saveAsTemplate(listId, title);
      set((state) => ({ templates: [template, ...state.templates] }));
    } catch {
      throw new Error('Failed to save template');
    }
  },

  createFromTemplate: async (templateId, newTitle) => {
    try {
      const newList = await listsService.createFromTemplate(templateId, newTitle);
      set((state) => ({ lists: [newList, ...state.lists] }));
      return newList;
    } catch {
      return null;
    }
  },

  setListBudget: (listId, budget) => {
    const list = get().lists.find((l) => l.id === listId);
    if (!list) return;

    const prevBudget = list.budget;

    set((state) => ({
      lists: state.lists.map((l) =>
        l.id === listId ? { ...l, budget } : l,
      ),
    }));

    listsService.updateListBudget(listId, budget).catch(() => {
      set((state) => ({
        lists: state.lists.map((l) =>
          l.id === listId ? { ...l, budget: prevBudget } : l,
        ),
      }));
    });
  },
}));

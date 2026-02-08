import { create } from 'zustand';
import type { Store } from '@shopwise/shared';
import { storesService } from '@/services/stores.service';

interface StoresState {
  stores: Store[];
  isLoading: boolean;
  selectedStoreId: string | null;
  fetchStores: () => Promise<void>;
  createStore: (store: { name: string; location?: string; color: string }) => Promise<Store>;
  setSelectedStore: (id: string | null) => void;
  getStoreById: (id: string) => Store | undefined;
}

export const useStoresStore = create<StoresState>((set, get) => ({
  stores: [],
  isLoading: false,
  selectedStoreId: null,

  fetchStores: async () => {
    set({ isLoading: true });
    try {
      const stores = await storesService.getStores();
      set({ stores, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createStore: async (input) => {
    const store = await storesService.createStore(input);
    set((state) => ({
      stores: [...state.stores, store].sort((a, b) => a.name.localeCompare(b.name)),
      selectedStoreId: store.id,
    }));
    return store;
  },

  setSelectedStore: (id) => set({ selectedStoreId: id }),

  getStoreById: (id) => get().stores.find((s) => s.id === id),
}));

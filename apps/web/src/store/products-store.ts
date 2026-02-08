import { create } from 'zustand';
import type { Product, CategoryId } from '@shopwise/shared';
import { productsService } from '@/services/products.service';

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

export type SortBy = 'name' | 'price' | 'volatility';
export type SortDirection = 'asc' | 'desc';

export interface PriceRange {
  min: number | null;
  max: number | null;
}

interface ProductsState {
  products: Product[];
  searchQuery: string;
  activeCategory: CategoryId | 'all';
  compareList: string[];
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  sortBy: SortBy;
  sortDirection: SortDirection;
  priceRange: PriceRange;
  fetchProducts: () => Promise<void>;
  setSearch: (query: string) => void;
  setCategory: (category: CategoryId | 'all') => void;
  toggleCompare: (productId: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSort: (sortBy: SortBy, direction: SortDirection) => void;
  setPriceFilter: (min: number | null, max: number | null) => void;
  clearPriceFilter: () => void;
  getFilteredProducts: () => Product[];
}

const VOLATILITY_ORDER: Record<string, number> = {
  low: 0,
  stable: 1,
  high: 2,
};

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  searchQuery: '',
  activeCategory: 'all',
  compareList: [],
  viewMode: 'grid',
  isLoading: false,
  sortBy: 'name',
  sortDirection: 'asc',
  priceRange: { min: null, max: null },

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const { activeCategory } = get();
      const cat = activeCategory === 'all' ? undefined : activeCategory;
      const products = await productsService.getProducts(cat);
      set({ products, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setSearch: (query) => {
    set({ searchQuery: query });
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      set({ isLoading: true });
      try {
        const { activeCategory } = get();
        const cat = activeCategory === 'all' ? undefined : activeCategory;
        const products = query
          ? await productsService.searchProducts(query, cat)
          : await productsService.getProducts(cat);
        set({ products, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    }, 300);
  },

  setCategory: (category) => {
    set({ activeCategory: category });
    const { searchQuery } = get();
    const cat = category === 'all' ? undefined : category;
    (async () => {
      set({ isLoading: true });
      try {
        const products = searchQuery
          ? await productsService.searchProducts(searchQuery, cat)
          : await productsService.getProducts(cat);
        set({ products, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    })();
  },

  toggleCompare: (productId) =>
    set((state) => ({
      compareList: state.compareList.includes(productId)
        ? state.compareList.filter((id) => id !== productId)
        : [...state.compareList, productId],
    })),

  setViewMode: (mode) => set({ viewMode: mode }),
  setSort: (sortBy, direction) => set({ sortBy, sortDirection: direction }),
  setPriceFilter: (min, max) => set({ priceRange: { min, max } }),
  clearPriceFilter: () => set({ priceRange: { min: null, max: null } }),

  getFilteredProducts: () => {
    const { products, searchQuery, activeCategory, sortBy, sortDirection, priceRange } = get();
    let filtered = products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || p.categoryId === activeCategory;
      const matchesPrice =
        (priceRange.min === null || p.averagePrice >= priceRange.min) &&
        (priceRange.max === null || p.averagePrice <= priceRange.max);
      return matchesSearch && matchesCategory && matchesPrice;
    });
    filtered = [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'price':
          cmp = a.averagePrice - b.averagePrice;
          break;
        case 'volatility':
          cmp = (VOLATILITY_ORDER[a.volatility] ?? 1) - (VOLATILITY_ORDER[b.volatility] ?? 1);
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return filtered;
  },
}));

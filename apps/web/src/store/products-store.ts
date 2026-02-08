import { create } from 'zustand';
import type { Product, CategoryId } from '@shopwise/shared';
import { productsService } from '@/services/products.service';

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

interface ProductsState {
  products: Product[];
  searchQuery: string;
  activeCategory: CategoryId | 'all';
  compareList: string[];
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  setSearch: (query: string) => void;
  setCategory: (category: CategoryId | 'all') => void;
  toggleCompare: (productId: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  getFilteredProducts: () => Product[];
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  searchQuery: '',
  activeCategory: 'all',
  compareList: [],
  viewMode: 'grid',
  isLoading: false,

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

  getFilteredProducts: () => {
    const { products, searchQuery, activeCategory } = get();
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || p.categoryId === activeCategory;
      return matchesSearch && matchesCategory;
    });
  },
}));

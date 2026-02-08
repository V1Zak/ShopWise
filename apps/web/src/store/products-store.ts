import { create } from 'zustand';
import type { Product, CategoryId } from '@shopwise/shared';
import { mockProducts } from '@/data/mock-products';

interface ProductsState {
  products: Product[];
  searchQuery: string;
  activeCategory: CategoryId | 'all';
  compareList: string[];
  viewMode: 'grid' | 'list';
  setSearch: (query: string) => void;
  setCategory: (category: CategoryId | 'all') => void;
  toggleCompare: (productId: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  getFilteredProducts: () => Product[];
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: mockProducts,
  searchQuery: '',
  activeCategory: 'all',
  compareList: [],
  viewMode: 'grid',

  setSearch: (query) => set({ searchQuery: query }),
  setCategory: (category) => set({ activeCategory: category }),
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

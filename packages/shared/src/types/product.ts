import type { CategoryId } from './category';

export interface StorePrice {
  storeId: string;
  storeName: string;
  storeColor: string;
  price: number;
  lastUpdated: string;
}

export interface Product {
  id: string;
  barcode?: string;
  name: string;
  brand?: string;
  description?: string;
  categoryId: CategoryId;
  imageUrl?: string;
  unit: string;
  averagePrice: number;
  storePrices: StorePrice[];
  priceHistory: number[];
  volatility: 'low' | 'stable' | 'high';
  volatilityLabel?: string;
  badge?: string;
  badgeColor?: string;
  createdAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}

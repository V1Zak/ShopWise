export interface ShoppingList {
  id: string;
  ownerId: string;
  title: string;
  storeId?: string;
  storeName?: string;
  isTemplate: boolean;
  budget?: number | null;
  itemCount: number;
  estimatedTotal: number;
  createdAt: string;
  updatedAt: string;
}

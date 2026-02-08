import type { CategoryId } from './category';

export type ListItemStatus = 'to_buy' | 'in_cart' | 'skipped';

export interface ListItem {
  id: string;
  listId: string;
  productId?: string;
  name: string;
  categoryId: CategoryId;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  actualPrice?: number;
  status: ListItemStatus;
  tags?: string[];
  sortOrder: number;
}

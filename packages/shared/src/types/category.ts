export type CategoryId =
  | 'produce'
  | 'dairy'
  | 'meat'
  | 'bakery'
  | 'pantry'
  | 'beverages'
  | 'frozen'
  | 'household'
  | 'snacks'
  | 'other';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  aisle?: number;
}

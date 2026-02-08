import type { Category } from '../types/category';

export const CATEGORIES: Category[] = [
  { id: 'produce', name: 'Produce', icon: 'nutrition', aisle: 1 },
  { id: 'dairy', name: 'Dairy & Eggs', icon: 'egg_alt', aisle: 4 },
  { id: 'meat', name: 'Meat & Seafood', icon: 'set_meal', aisle: 5 },
  { id: 'bakery', name: 'Bakery', icon: 'bakery_dining', aisle: 2 },
  { id: 'pantry', name: 'Pantry Staples', icon: 'kitchen', aisle: 7 },
  { id: 'beverages', name: 'Beverages', icon: 'local_cafe', aisle: 8 },
  { id: 'frozen', name: 'Frozen', icon: 'ac_unit', aisle: 9 },
  { id: 'household', name: 'Household', icon: 'cleaning_services', aisle: 10 },
  { id: 'snacks', name: 'Snacks', icon: 'cookie', aisle: 6 },
  { id: 'other', name: 'Other', icon: 'category' },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<string, Category>;

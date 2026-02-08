import type { ShoppingList } from '@shopwise/shared';

export const mockShoppingLists: ShoppingList[] = [
  {
    id: 'list1',
    ownerId: 'u1',
    title: "Trader Joe's Run",
    storeId: 's4',
    storeName: "Trader Joe's",
    isTemplate: false,
    itemCount: 12,
    estimatedTotal: 45.0,
    createdAt: '2023-10-24',
    updatedAt: '2023-10-24',
  },
  {
    id: 'list2',
    ownerId: 'u1',
    title: 'Weekly Groceries',
    storeId: 's1',
    storeName: 'Walmart Supercenter',
    isTemplate: false,
    itemCount: 24,
    estimatedTotal: 145.50,
    createdAt: '2023-10-20',
    updatedAt: '2023-10-24',
  },
];

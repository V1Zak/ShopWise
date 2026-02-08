import type { ListItem } from '@shopwise/shared';

export const mockListItems: ListItem[] = [
  // Trader Joe's Run items (list1) — shown on dashboard
  { id: 'li1', listId: 'list1', productId: 'p1', name: 'Organic Whole Milk', categoryId: 'dairy', quantity: 1, unit: '1 Gallon', estimatedPrice: 4.99, status: 'to_buy', tags: ['Dairy'], sortOrder: 1 },
  { id: 'li2', listId: 'list1', productId: 'p11', name: 'Sourdough Bread', categoryId: 'bakery', quantity: 1, unit: '1 Loaf', estimatedPrice: 3.49, status: 'to_buy', tags: ['Bakery'], sortOrder: 2 },
  { id: 'li3', listId: 'list1', productId: 'p8', name: 'Avocados (4ct)', categoryId: 'produce', quantity: 1, unit: '4 Count', estimatedPrice: 5.99, status: 'to_buy', tags: ['Produce'], sortOrder: 3 },
  { id: 'li4', listId: 'list1', productId: 'p12', name: 'Chicken Breast', categoryId: 'meat', quantity: 1, unit: '2 lb', estimatedPrice: 12.50, status: 'to_buy', tags: ['Meat'], sortOrder: 4 },
  { id: 'li5', listId: 'list1', productId: 'p10', name: 'Greek Yogurt', categoryId: 'dairy', quantity: 1, unit: '32oz Tub', estimatedPrice: 5.29, status: 'to_buy', tags: ['Dairy'], sortOrder: 5 },

  // Weekly Groceries items (list2) — shown on active shopping list page
  { id: 'li10', listId: 'list2', productId: 'p7', name: 'Bananas (Organic)', categoryId: 'produce', quantity: 1, unit: '1 Bunch', estimatedPrice: 0.69, status: 'to_buy', tags: ['~1.2lb'], sortOrder: 1 },
  { id: 'li11', listId: 'list2', productId: 'p8', name: 'Avocados', categoryId: 'produce', quantity: 4, unit: '4 Count', estimatedPrice: 3.99, actualPrice: 3.50, status: 'to_buy', tags: ['On Sale'], sortOrder: 2 },
  { id: 'li12', listId: 'list2', productId: 'p9', name: 'Almond Milk (Unsweetened)', categoryId: 'dairy', quantity: 1, unit: '1 Gallon', estimatedPrice: 3.49, status: 'to_buy', sortOrder: 3 },
  { id: 'li13', listId: 'list2', productId: 'p10', name: 'Greek Yogurt', categoryId: 'dairy', quantity: 1, unit: '32oz Tub', estimatedPrice: 5.29, status: 'to_buy', sortOrder: 4 },
  { id: 'li14', listId: 'list2', productId: 'p13', name: 'Pasta Sauce (Marinara)', categoryId: 'pantry', quantity: 1, unit: '24oz Jar', estimatedPrice: 2.49, status: 'to_buy', tags: ['Low Stock'], sortOrder: 5 },
  // In Cart items
  { id: 'li15', listId: 'list2', productId: 'p1', name: 'Organic Whole Milk', categoryId: 'dairy', quantity: 1, unit: '1 Gallon', estimatedPrice: 4.99, actualPrice: 4.99, status: 'in_cart', sortOrder: 6 },
  { id: 'li16', listId: 'list2', productId: 'p11', name: 'Sourdough Bread', categoryId: 'bakery', quantity: 1, unit: '1 Loaf', estimatedPrice: 3.49, actualPrice: 3.49, status: 'in_cart', sortOrder: 7 },
  { id: 'li17', listId: 'list2', productId: 'p12', name: 'Chicken Breast', categoryId: 'meat', quantity: 1, unit: '2 lb', estimatedPrice: 12.50, actualPrice: 11.99, status: 'in_cart', sortOrder: 8 },
  { id: 'li18', listId: 'list2', productId: 'p5', name: 'Honeycrisp Apples', categoryId: 'produce', quantity: 2, unit: 'Per lb', estimatedPrice: 2.49, actualPrice: 1.99, status: 'in_cart', sortOrder: 9 },
  { id: 'li19', listId: 'list2', productId: 'p4', name: 'Raw Almonds', categoryId: 'snacks', quantity: 1, unit: '16oz Bag', estimatedPrice: 8.45, actualPrice: 7.49, status: 'in_cart', sortOrder: 10 },
  { id: 'li20', listId: 'list2', productId: 'p6', name: 'Spicy Ramen Pack', categoryId: 'pantry', quantity: 1, unit: '5ct Pack', estimatedPrice: 6.99, actualPrice: 5.99, status: 'in_cart', sortOrder: 11 },
];

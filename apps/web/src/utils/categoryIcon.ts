const CATEGORY_ICONS: Record<string, string> = {
  produce: 'nutrition',
  dairy: 'egg_alt',
  meat: 'set_meal',
  bakery: 'bakery_dining',
  pantry: 'kitchen',
  beverages: 'local_cafe',
  frozen: 'ac_unit',
  household: 'cleaning_services',
  snacks: 'cookie',
};

export function categoryIcon(categoryId: string): string {
  return CATEGORY_ICONS[categoryId] ?? 'shopping_bag';
}

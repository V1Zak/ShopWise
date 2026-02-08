export interface TripInsight {
  type: 'win' | 'warning' | 'info';
  icon: string;
  title: string;
  description: string;
}

export interface CategoryBreakdown {
  category: string;
  percentage: number;
  color: string;
}

export interface ShoppingTrip {
  id: string;
  userId: string;
  listId: string;
  storeId: string;
  storeName: string;
  storeLogo?: string;
  date: string;
  itemCount: number;
  totalSpent: number;
  totalSaved: number;
  efficiencyScore?: number;
  topCategory?: string;
  topCategoryPercentage?: number;
  variance?: string;
  categoryBreakdown: CategoryBreakdown[];
  insights: TripInsight[];
  tags?: string[];
}

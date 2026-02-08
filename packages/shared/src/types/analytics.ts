export interface MonthlySpending {
  month: string;
  amount: number;
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface PriceAlert {
  id: string;
  productName: string;
  productImage?: string;
  currentPrice: number;
  priceChange: string;
  priceChangePercent: number;
  trend: number[];
  savings?: string;
  lastBought: string;
}

export interface AnalyticsSummary {
  totalSpentYTD: number;
  totalSpentChange: number;
  monthlyAverage: number;
  monthlyAverageChange: number;
  totalSavings: number;
  savingsRate: number;
  monthlySpending: MonthlySpending[];
  categorySpending: CategorySpending[];
  priceAlerts: PriceAlert[];
}

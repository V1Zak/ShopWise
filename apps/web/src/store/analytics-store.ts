import { create } from 'zustand';
import type { AnalyticsSummary } from '@shopwise/shared';
import { analyticsService } from '@/services/analytics.service';

const emptyAnalytics: AnalyticsSummary = {
  totalSpentYTD: 0,
  totalSpentChange: 0,
  monthlyAverage: 0,
  monthlyAverageChange: 0,
  totalSavings: 0,
  savingsRate: 0,
  monthlySpending: [],
  categorySpending: [],
  priceAlerts: [],
};

interface AnalyticsState {
  data: AnalyticsSummary;
  period: 'Monthly' | 'Quarterly' | 'YTD';
  isLoading: boolean;
  fetchAnalytics: () => Promise<void>;
  setPeriod: (period: 'Monthly' | 'Quarterly' | 'YTD') => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  data: emptyAnalytics,
  period: 'Monthly',
  isLoading: false,

  fetchAnalytics: async () => {
    set({ isLoading: true });
    try {
      const data = await analyticsService.getAnalyticsSummary();
      set({ data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setPeriod: (period) => {
    set({ period });
    // Re-fetch could be added here for server-side period filtering
  },
}));

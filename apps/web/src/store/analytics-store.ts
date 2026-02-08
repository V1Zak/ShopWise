import { create } from 'zustand';
import type { AnalyticsSummary } from '@shopwise/shared';
import { analyticsService } from '@/services/analytics.service';
import type { AnalyticsPeriod } from '@/services/analytics.service';

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
  period: AnalyticsPeriod;
  isLoading: boolean;
  fetchAnalytics: (period?: AnalyticsPeriod) => Promise<void>;
  setPeriod: (period: AnalyticsPeriod) => void;
}

let latestRequestId = 0;

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  data: emptyAnalytics,
  period: 'Monthly',
  isLoading: false,

  fetchAnalytics: async (period?: AnalyticsPeriod) => {
    const activePeriod = period ?? get().period;
    const requestId = ++latestRequestId;
    set({ isLoading: true });
    try {
      const data = await analyticsService.getAnalyticsSummary(activePeriod);
      if (requestId === latestRequestId) {
        set({ data, isLoading: false });
      }
    } catch {
      if (requestId === latestRequestId) {
        set({ isLoading: false });
      }
    }
  },

  setPeriod: (period) => {
    set({ period });
    get().fetchAnalytics(period);
  },
}));

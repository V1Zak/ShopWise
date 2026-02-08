import { create } from 'zustand';
import type { AnalyticsSummary } from '@shopwise/shared';
import { mockAnalytics } from '@/data/mock-analytics';

interface AnalyticsState {
  data: AnalyticsSummary;
  period: 'Monthly' | 'Quarterly' | 'YTD';
  setPeriod: (period: 'Monthly' | 'Quarterly' | 'YTD') => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  data: mockAnalytics,
  period: 'Monthly',
  setPeriod: (period) => set({ period }),
}));

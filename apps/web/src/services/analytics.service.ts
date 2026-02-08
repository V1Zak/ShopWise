import { supabase } from '@/lib/supabase';
import type { AnalyticsSummary } from '@shopwise/shared';

export type AnalyticsPeriod = 'Weekly' | 'Monthly' | 'Quarterly' | 'YTD';

function getDateRangeStart(period: AnalyticsPeriod): string {
  const now = new Date();
  let start: Date;

  switch (period) {
    case 'Weekly':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case 'Monthly':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      break;
    case 'Quarterly':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
      break;
    case 'YTD':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 365);
      break;
  }

  return start.toISOString().slice(0, 10);
}

export const analyticsService = {
  async getAnalyticsSummary(period: AnalyticsPeriod = 'Monthly'): Promise<AnalyticsSummary> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const rangeStart = getDateRangeStart(period);

    const { data: trips, error } = await supabase
      .from('shopping_trips')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', rangeStart)
      .order('date', { ascending: true });

    if (error) throw error;

    const allTrips = trips ?? [];

    const totalSpentYTD = allTrips.reduce((s, t) => s + Number(t.total_spent), 0);
    const totalSavings = allTrips.reduce((s, t) => s + Number(t.total_saved), 0);
    const months = new Set(allTrips.map((t) => new Date(t.date).toISOString().slice(0, 7)));
    const monthCount = Math.max(months.size, 1);
    const monthlyAverage = totalSpentYTD / monthCount;

    // Monthly spending breakdown
    const monthMap = new Map<string, number>();
    for (const t of allTrips) {
      const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
      monthMap.set(month, (monthMap.get(month) ?? 0) + Number(t.total_spent));
    }
    const monthlySpending = [...monthMap.entries()].map(([month, amount]) => ({
      month,
      amount: Math.round(amount * 100) / 100,
    }));

    // Category spending from trip metadata
    const categoryMap = new Map<string, number>();
    for (const t of allTrips) {
      const meta = (t.metadata ?? {}) as Record<string, unknown>;
      const breakdown = (meta.categoryBreakdown ?? []) as { category: string; percentage: number }[];
      for (const cat of breakdown) {
        const amount = Number(t.total_spent) * (cat.percentage / 100);
        categoryMap.set(cat.category, (categoryMap.get(cat.category) ?? 0) + amount);
      }
    }
    const totalCategorySpend = [...categoryMap.values()].reduce((s, v) => s + v, 0) || 1;
    const colors = ['#13ec80', '#2dd4bf', '#3b82f6', '#234836', '#a78bfa', '#f59e0b'];
    const categorySpending = [...categoryMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount], i) => ({
        category,
        amount: Math.round(amount * 100) / 100,
        percentage: Math.round((amount / totalCategorySpend) * 100),
        color: colors[i % colors.length],
      }));

    return {
      totalSpentYTD: Math.round(totalSpentYTD * 100) / 100,
      totalSpentChange: 0,
      monthlyAverage: Math.round(monthlyAverage * 100) / 100,
      monthlyAverageChange: 0,
      totalSavings: Math.round(totalSavings * 100) / 100,
      savingsRate: totalSpentYTD > 0 ? Math.round((totalSavings / totalSpentYTD) * 100) : 0,
      monthlySpending,
      categorySpending,
      priceAlerts: [],
    };
  },
};

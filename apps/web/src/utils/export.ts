import type { ShoppingTrip, AnalyticsSummary } from '@shopwise/shared';

function downloadFile(filename: string, content: string, mimeType = 'text/csv') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSV(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportTripsToCSV(trips: ShoppingTrip[]): void {
  const headers = [
    'Date', 'Store', 'Items', 'Total Spent', 'Total Saved',
    'Efficiency Score', 'Top Category', 'Top Category %', 'Variance', 'Tags',
  ];
  const rows = trips.map((trip) => [
    escapeCSV(trip.date),
    escapeCSV(trip.storeName),
    escapeCSV(trip.itemCount),
    escapeCSV(trip.totalSpent.toFixed(2)),
    escapeCSV(trip.totalSaved.toFixed(2)),
    escapeCSV(trip.efficiencyScore ?? ''),
    escapeCSV(trip.topCategory ?? ''),
    escapeCSV(trip.topCategoryPercentage != null ? `${trip.topCategoryPercentage}%` : ''),
    escapeCSV(trip.variance ?? ''),
    escapeCSV(trip.tags?.join('; ') ?? ''),
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadFile(`shopwise-history-${timestamp}.csv`, csv);
}

export function exportAnalyticsReport(analytics: AnalyticsSummary, period: string): void {
  const sections: string[] = [];
  sections.push('=== SPENDING ANALYTICS REPORT ===');
  sections.push(`Period,${escapeCSV(period)}`);
  sections.push(`Generated,${escapeCSV(new Date().toLocaleString())}`);
  sections.push('');
  sections.push('--- Key Performance Indicators ---');
  sections.push(`Total Spent (YTD),${escapeCSV(analytics.totalSpentYTD.toFixed(2))}`);
  sections.push(`YTD Change %,${escapeCSV(analytics.totalSpentChange.toFixed(1))}`);
  sections.push(`Monthly Average,${escapeCSV(analytics.monthlyAverage.toFixed(2))}`);
  sections.push(`Monthly Average Change %,${escapeCSV(analytics.monthlyAverageChange.toFixed(1))}`);
  sections.push(`Total Savings,${escapeCSV(analytics.totalSavings.toFixed(2))}`);
  sections.push(`Savings Rate %,${escapeCSV(analytics.savingsRate.toFixed(1))}`);
  sections.push('');
  sections.push('--- Monthly Spending ---');
  sections.push('Month,Amount');
  for (const m of analytics.monthlySpending) {
    sections.push(`${escapeCSV(m.month)},${escapeCSV(m.amount.toFixed(2))}`);
  }
  sections.push('');
  sections.push('--- Category Breakdown ---');
  sections.push('Category,Amount,Percentage');
  for (const c of analytics.categorySpending) {
    sections.push(`${escapeCSV(c.category)},${escapeCSV(c.amount.toFixed(2))},${escapeCSV(c.percentage.toFixed(1) + '%')}`);
  }
  sections.push('');
  if (analytics.priceAlerts.length > 0) {
    sections.push('--- Price Alerts ---');
    sections.push('Product,Current Price,Price Change,Change %,Last Bought');
    for (const a of analytics.priceAlerts) {
      sections.push([
        escapeCSV(a.productName),
        escapeCSV(a.currentPrice.toFixed(2)),
        escapeCSV(a.priceChange),
        escapeCSV(a.priceChangePercent.toFixed(1) + '%'),
        escapeCSV(a.lastBought),
      ].join(','));
    }
  }
  const csv = sections.join('\n');
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadFile(`shopwise-analytics-report-${timestamp}.csv`, csv);
}

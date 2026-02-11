import { useUIStore } from '@/store/ui-store';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export const DEFAULT_CURRENCY = 'USD';

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currencyCode: string): Intl.NumberFormat {
  let formatter = formatterCache.get(currencyCode);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    formatterCache.set(currencyCode, formatter);
  }
  return formatter;
}

export function formatPrice(amount: number, currencyCode?: string): string {
  const code = currencyCode ?? useUIStore.getState().currency;
  return getFormatter(code).format(amount);
}

export function getCurrencySymbol(currencyCode?: string): string {
  const code = currencyCode ?? useUIStore.getState().currency;
  const info = SUPPORTED_CURRENCIES.find((c) => c.code === code);
  return info?.symbol ?? '$';
}

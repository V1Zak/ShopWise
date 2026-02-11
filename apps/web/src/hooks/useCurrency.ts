import { useUIStore } from '@/store/ui-store';
import { formatPrice as formatPriceUtil, getCurrencySymbol } from '@/utils/currency';

export function useCurrency() {
  const currencyCode = useUIStore((s) => s.currency);
  const symbol = getCurrencySymbol(currencyCode);

  const formatPrice = (amount: number) => formatPriceUtil(amount, currencyCode);

  return { currencyCode, symbol, formatPrice };
}

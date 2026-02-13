import type { ShoppingTrip } from '@shopwise/shared';
import { useTripsStore } from '@/store/trips-store';
import { useCurrency } from '@/hooks/useCurrency';

interface Props {
  trip: ShoppingTrip;
  isExpanded: boolean;
}

export function TripRow({ trip, isExpanded }: Props) {
  const toggleExpand = useTripsStore((s) => s.toggleExpand);
  const savingsPositive = trip.totalSaved >= 0;
  const { formatPrice } = useCurrency();

  return (
    <tr
      onClick={() => toggleExpand(trip.id)}
      className={`group hover:bg-surface-active transition-colors cursor-pointer border-l-4 ${
        isExpanded ? 'bg-surface-active/50 border-l-primary' : 'border-l-transparent hover:border-l-text-muted'
      }`}
    >
      <td className="py-4 px-6 text-text font-medium whitespace-nowrap">{trip.date}</td>
      <td className="py-4 px-6 text-text">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-active flex items-center justify-center text-xs font-bold text-text">
            {trip.storeName.charAt(0)}
          </div>
          <span className="font-semibold">{trip.storeName}</span>
          {trip.tags?.map((tag) => (
            <span key={tag} className="text-[10px] bg-surface-active text-text-muted px-1.5 py-0.5 rounded ml-1">{tag}</span>
          ))}
        </div>
      </td>
      <td className="py-4 px-6 text-text-muted text-center">{trip.itemCount}</td>
      <td className="py-4 px-6 text-text font-bold text-right font-mono">{formatPrice(trip.totalSpent)}</td>
      <td className={`py-4 px-6 font-bold text-right font-mono ${savingsPositive ? 'text-primary' : 'text-red-400'}`}>
        <span className={`${savingsPositive ? 'bg-primary/10' : 'bg-red-400/10'} px-2 py-1 rounded`}>
          {savingsPositive ? '-' : '+'}{formatPrice(Math.abs(trip.totalSaved))}
        </span>
      </td>
      <td className="py-4 px-6 text-right">
        <button className="text-text-muted hover:text-text">
          <span aria-hidden="true" className="material-symbols-outlined">
            {isExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </td>
    </tr>
  );
}

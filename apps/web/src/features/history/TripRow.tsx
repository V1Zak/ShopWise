import type { ShoppingTrip } from '@shopwise/shared';
import { useTripsStore } from '@/store/trips-store';

interface Props {
  trip: ShoppingTrip;
  isExpanded: boolean;
}

export function TripRow({ trip, isExpanded }: Props) {
  const toggleExpand = useTripsStore((s) => s.toggleExpand);
  const savingsPositive = trip.totalSaved >= 0;

  return (
    <tr
      onClick={() => toggleExpand(trip.id)}
      className={`group hover:bg-[#1c382e] transition-colors cursor-pointer border-l-4 ${
        isExpanded ? 'bg-[#1c382e]/50 border-l-primary' : 'border-l-transparent hover:border-l-slate-600'
      }`}
    >
      <td className="py-4 px-6 text-white font-medium whitespace-nowrap">{trip.date}</td>
      <td className="py-4 px-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-green flex items-center justify-center text-xs font-bold text-white">
            {trip.storeName.charAt(0)}
          </div>
          <span className="font-semibold">{trip.storeName}</span>
          {trip.tags?.map((tag) => (
            <span key={tag} className="text-[10px] bg-accent-green text-slate-300 px-1.5 py-0.5 rounded ml-1">{tag}</span>
          ))}
        </div>
      </td>
      <td className="py-4 px-6 text-slate-300 text-center">{trip.itemCount}</td>
      <td className="py-4 px-6 text-white font-bold text-right font-mono">${trip.totalSpent.toFixed(2)}</td>
      <td className={`py-4 px-6 font-bold text-right font-mono ${savingsPositive ? 'text-primary' : 'text-red-400'}`}>
        <span className={`${savingsPositive ? 'bg-primary/10' : 'bg-red-400/10'} px-2 py-1 rounded`}>
          {savingsPositive ? '-' : '+'}${Math.abs(trip.totalSaved).toFixed(2)}
        </span>
      </td>
      <td className="py-4 px-6 text-right">
        <button className="text-slate-400 hover:text-white">
          <span className="material-symbols-outlined">
            {isExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </td>
    </tr>
  );
}

import type { ShoppingTrip } from '@shopwise/shared';

interface Props {
  trip: ShoppingTrip;
}

export function TripExpandedDetail({ trip }: Props) {
  return (
    <tr className="bg-[#152922] shadow-inner">
      <td className="p-0" colSpan={6}>
        <div className="p-6 border-b border-border-dark">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Summary */}
            <div className="flex-1 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Power Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background-dark p-3 rounded-lg border border-border-dark">
                  <span className="text-xs text-slate-400 block mb-1">Top Category</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-orange-400 text-sm">nutrition</span>
                    {trip.topCategory || 'N/A'} {trip.topCategoryPercentage ? `(${trip.topCategoryPercentage}%)` : ''}
                  </span>
                </div>
                <div className="bg-background-dark p-3 rounded-lg border border-border-dark">
                  <span className="text-xs text-slate-400 block mb-1">Variance</span>
                  <span className="text-red-400 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    {trip.variance || 'N/A'}
                  </span>
                </div>
              </div>
              {trip.categoryBreakdown.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-slate-400 mb-2">Spend Distribution</p>
                  <div className="w-full h-2 bg-accent-green rounded-full overflow-hidden flex">
                    {trip.categoryBreakdown.map((cat) => (
                      <div key={cat.category} className="h-full" style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} />
                    ))}
                  </div>
                  <div className="flex gap-4 mt-2 text-[10px] text-slate-400">
                    {trip.categoryBreakdown.map((cat) => (
                      <span key={cat.category} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Insights */}
            {trip.insights.length > 0 && (
              <div className="flex-1 border-l border-border-dark pl-0 md:pl-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Alerts & Insights</h4>
                <div className="space-y-3">
                  {trip.insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="mt-0.5 min-w-[20px]">
                        <span className={`material-symbols-outlined text-sm ${insight.type === 'win' ? 'text-primary' : 'text-red-400'}`}>
                          {insight.icon}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{insight.title}</p>
                        <p className="text-slate-400 text-xs">{insight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="text-xs text-primary hover:text-white font-medium flex items-center gap-1 transition-colors">
                    View Full Receipt
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

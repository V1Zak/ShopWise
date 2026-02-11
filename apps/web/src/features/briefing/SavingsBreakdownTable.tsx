interface SavingsItem {
  name: string;
  originalPrice: number;
  paidPrice: number;
  saved: number;
}

interface Props {
  items: SavingsItem[];
}

export function SavingsBreakdownTable({ items }: Props) {
  if (items.length === 0) return null;

  const totalOriginal = items.reduce((sum, i) => sum + i.originalPrice, 0);
  const totalPaid = items.reduce((sum, i) => sum + i.paidPrice, 0);
  const totalSaved = items.reduce((sum, i) => sum + i.saved, 0);

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">savings</span>
        <h3 className="text-text font-bold">Savings Breakdown</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-alt">
              <th className="text-left text-text-muted text-xs font-semibold uppercase tracking-wider px-5 py-3">Item</th>
              <th className="text-right text-text-muted text-xs font-semibold uppercase tracking-wider px-5 py-3">Original</th>
              <th className="text-right text-text-muted text-xs font-semibold uppercase tracking-wider px-5 py-3">Paid</th>
              <th className="text-right text-text-muted text-xs font-semibold uppercase tracking-wider px-5 py-3">Saved</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item, i) => (
              <tr key={i} className="hover:bg-surface-active/20">
                <td className="px-5 py-3 text-text font-medium">{item.name}</td>
                <td className="px-5 py-3 text-right text-text-muted font-mono line-through">${item.originalPrice.toFixed(2)}</td>
                <td className="px-5 py-3 text-right text-text font-mono font-bold">${item.paidPrice.toFixed(2)}</td>
                <td className="px-5 py-3 text-right text-primary font-mono font-bold">
                  {item.saved > 0 ? `-$${item.saved.toFixed(2)}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-surface-alt">
              <td className="px-5 py-3 text-text font-bold">Total</td>
              <td className="px-5 py-3 text-right text-text-muted font-mono">${totalOriginal.toFixed(2)}</td>
              <td className="px-5 py-3 text-right text-text font-mono font-bold">${totalPaid.toFixed(2)}</td>
              <td className="px-5 py-3 text-right text-primary font-mono font-bold">-${totalSaved.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

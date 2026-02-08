import { ProgressBar } from '@/components/ui/ProgressBar';

export function BudgetHealth() {
  return (
    <div className="bg-gradient-to-br from-background-dark to-surface-dark rounded-xl p-5 border border-border-dark">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
        <h4 className="text-white font-bold">Budget Health</h4>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text-secondary">Budget Used</span>
            <span className="text-white font-medium">29%</span>
          </div>
          <ProgressBar value={29} />
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border-dark">
          <span className="text-sm text-text-secondary">Remaining</span>
          <span className="text-lg font-bold text-white">$103.32</span>
        </div>
      </div>
    </div>
  );
}

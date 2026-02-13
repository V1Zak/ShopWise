import { useState, useRef, useEffect } from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { ListItem } from '@shopwise/shared';
import { useCurrency } from '@/hooks/useCurrency';

interface BudgetHealthProps {
  budget: number | null | undefined;
  items: ListItem[];
  onSetBudget: (budget: number | null) => void;
}

function getBudgetColor(percent: number): string {
  if (percent > 90) return 'bg-red-500';
  if (percent > 70) return 'bg-yellow-500';
  return 'bg-primary';
}

function getBudgetLabel(percent: number): string {
  if (percent > 100) return 'Over budget!';
  if (percent > 90) return 'Almost at limit';
  if (percent > 70) return 'Watch spending';
  return 'On track';
}

function getBudgetTextColor(percent: number): string {
  if (percent > 90) return 'text-red-400';
  if (percent > 70) return 'text-yellow-400';
  return 'text-primary';
}

export function BudgetHealth({ budget, items, onSetBudget }: BudgetHealthProps) {
  const { formatPrice, symbol } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const spent = items
    .filter((item) => item.status === 'in_cart')
    .reduce((sum, item) => sum + (item.actualPrice ?? item.estimatedPrice) * (item.quantity || 1), 0);

  const handleStartEdit = () => {
    setInputValue(budget ? String(budget) : '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (savingRef.current) return;
    savingRef.current = true;
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed) && parsed > 0) {
      onSetBudget(parsed);
    }
    setIsEditing(false);
    savingRef.current = false;
  };

  const handleClear = () => {
    onSetBudget(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setIsEditing(false);
  };

  if (budget == null) {
    return (
      <div className="bg-gradient-to-br from-bg to-surface rounded-xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <span aria-hidden="true" className="material-symbols-outlined text-primary">account_balance_wallet</span>
          <h4 className="text-text font-bold">Budget Health</h4>
        </div>
        {isEditing ? (
          <div className="space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">{symbol}</span>
              <input
                ref={inputRef}
                type="number"
                min="0"
                step="0.01"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-surface border border-border rounded-lg py-2 pl-7 pr-3 text-text text-sm focus:outline-none focus:border-primary"
                placeholder="Enter budget amount"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-primary text-text-inv font-medium text-sm py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Set Budget
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 border border-border text-text-muted text-sm py-1.5 rounded-lg hover:text-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleStartEdit}
            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border rounded-lg text-text-muted hover:text-primary hover:border-primary transition-colors"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-sm">add</span>
            <span className="text-sm">Set a shopping budget</span>
          </button>
        )}
      </div>
    );
  }

  const remaining = budget - spent;
  const percent = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const overBudget = spent > budget;
  const color = getBudgetColor(percent);
  const label = getBudgetLabel(percent);
  const textColor = getBudgetTextColor(percent);

  return (
    <div className="bg-gradient-to-br from-bg to-surface rounded-xl p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="material-symbols-outlined text-primary">account_balance_wallet</span>
          <h4 className="text-text font-bold">Budget Health</h4>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          percent > 90 ? 'bg-red-500/20 text-red-400' :
          percent > 70 ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-primary/20 text-primary'
        }`}>
          {label}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-muted">Budget</span>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <span className="text-text-muted text-sm">{symbol}</span>
              <input
                ref={inputRef}
                type="number"
                min="0"
                step="0.01"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                className="w-24 bg-surface border border-border rounded px-2 py-0.5 text-text text-sm text-right focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleClear}
                className="ml-1 text-text-muted hover:text-red-400 transition-colors"
                title="Remove budget"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartEdit}
              className="text-text font-medium hover:text-primary transition-colors flex items-center gap-1"
            >
              {formatPrice(budget)}
              <span aria-hidden="true" className="material-symbols-outlined text-text-muted text-sm">edit</span>
            </button>
          )}
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text-muted">Budget Used</span>
            <span className={`font-medium ${textColor}`}>{Math.round(percent)}%</span>
          </div>
          <ProgressBar value={percent} color={color} />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
          <div>
            <span className="text-xs text-text-muted block">Spent</span>
            <span className="text-text font-bold">{formatPrice(spent)}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-text-muted block">Remaining</span>
            <span className={`font-bold ${overBudget ? 'text-red-400' : 'text-primary'}`}>
              {overBudget ? '-' : ''}{formatPrice(Math.abs(remaining))}
            </span>
          </div>
        </div>

        {overBudget && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <span aria-hidden="true" className="material-symbols-outlined text-red-400 text-sm">warning</span>
            <span className="text-red-400 text-xs">
              Over budget by {formatPrice(spent - budget)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

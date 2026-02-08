import type { ListItemStatus } from '@shopwise/shared';

interface ListTabsProps {
  activeTab: ListItemStatus;
  onTabChange: (tab: ListItemStatus) => void;
  counts: Record<ListItemStatus, number>;
}

const tabs: { key: ListItemStatus; label: string }[] = [
  { key: 'to_buy', label: 'To Buy' },
  { key: 'in_cart', label: 'In Cart' },
  { key: 'skipped', label: 'Skipped' },
];

export function ListTabs({ activeTab, onTabChange, counts }: ListTabsProps) {
  return (
    <div className="flex gap-6 px-6 border-b border-border-dark">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`pb-3 border-b-2 font-medium text-sm px-1 transition-colors ${
            activeTab === tab.key
              ? 'border-primary text-white'
              : 'border-transparent text-text-secondary hover:text-white'
          }`}
        >
          {tab.label} ({counts[tab.key]})
        </button>
      ))}
    </div>
  );
}

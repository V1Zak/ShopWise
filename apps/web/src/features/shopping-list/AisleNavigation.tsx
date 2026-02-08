import { useMemo } from 'react';
import { CATEGORY_MAP } from '@shopwise/shared';
import type { ListItem } from '@shopwise/shared';

interface AisleSection {
  categoryId: string;
  label: string;
  icon: string;
  aisle?: number;
  items: ListItem[];
  completed: number;
}

interface Props {
  items: ListItem[];
}

export function AisleNavigation({ items }: Props) {
  const sections = useMemo(() => {
    const grouped = items.reduce<Record<string, ListItem[]>>((acc, item) => {
      const cat = item.categoryId;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});

    const result: AisleSection[] = Object.entries(grouped)
      .map(([catId, catItems]) => {
        const category = CATEGORY_MAP[catId];
        return {
          categoryId: catId,
          label: category?.name || catId,
          icon: category?.icon || 'category',
          aisle: category?.aisle,
          items: catItems,
          completed: catItems.filter((i) => i.status === 'in_cart').length,
        };
      })
      .sort((a, b) => (a.aisle ?? 99) - (b.aisle ?? 99));

    return result;
  }, [items]);

  const activeSection = sections.find((s) => s.completed < s.items.length);
  const activeSectionId = activeSection?.categoryId ?? sections[0]?.categoryId;

  const activeIndex = sections.findIndex((s) => s.categoryId === activeSectionId);
  const nextSection = activeIndex >= 0 && activeIndex < sections.length - 1
    ? sections[activeIndex + 1]
    : null;

  const totalItems = items.length;
  const completedItems = items.filter((i) => i.status === 'in_cart').length;
  const completedSections = sections.filter((s) => s.completed === s.items.length).length;

  if (sections.length === 0) {
    return (
      <div className="bg-background-dark rounded-xl p-5 border border-border-dark">
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="material-symbols-outlined">map</span>
          <span className="text-sm">Add items to see your shopping route</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-dark rounded-xl overflow-hidden border border-border-dark shadow-lg">
      <div className="relative h-56 bg-surface-dark">
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent" />
        <div className="absolute bottom-4 left-4">
          <div className="text-white text-lg font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">location_on</span>
            {activeSection?.aisle
              ? `Aisle ${activeSection.aisle}: ${activeSection.label}`
              : activeSection?.label ?? 'Shopping Route'}
          </div>
          {nextSection && (
            <div className="text-text-secondary text-sm mt-1">
              Next: {nextSection.aisle ? `Aisle ${nextSection.aisle}` : ''} ({nextSection.label})
            </div>
          )}
        </div>
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white border border-white/10">
          {completedItems}/{totalItems} items
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-white font-semibold">Shopping Route</h4>
          <span className="text-xs text-primary font-medium">
            {completedSections}/{sections.length} sections done
          </span>
        </div>
        <div className="space-y-4 relative">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border-dark" />
          {sections.map((section) => {
            const isActive = section.categoryId === activeSectionId;
            const isDone = section.completed === section.items.length;
            return (
              <div key={section.categoryId} className="relative flex gap-3 items-start z-10">
                <div
                  className={`w-6 h-6 rounded-full border-4 border-background-dark shrink-0 flex items-center justify-center ${
                    isDone
                      ? 'bg-primary'
                      : isActive
                        ? 'bg-primary animate-pulse'
                        : 'bg-accent-green'
                  }`}
                >
                  {isDone && (
                    <span className="material-symbols-outlined text-background-dark text-xs font-bold">
                      check
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <div className={`text-sm font-medium ${isActive ? 'text-white' : isDone ? 'text-primary' : 'text-text-secondary'}`}>
                      <span className="material-symbols-outlined text-xs mr-1 align-middle">{section.icon}</span>
                      {section.label}
                      {section.aisle ? ` (Aisle ${section.aisle})` : ''}
                    </div>
                    <span className={`text-xs ${isDone ? 'text-primary' : 'text-text-secondary'}`}>
                      {section.completed}/{section.items.length}
                    </span>
                  </div>
                  <div className={`text-xs truncate ${isActive ? 'text-text-secondary' : 'text-[#517d66]'}`}>
                    {section.items.map((i) => i.name).join(', ')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

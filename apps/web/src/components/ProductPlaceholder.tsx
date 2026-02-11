import { categoryImages } from '@/assets/imageAssets';

interface ProductPlaceholderProps {
  categoryId?: string;
  className?: string;
}

const categoryIcons: Record<string, string> = {
  produce: 'nutrition',
  dairy: 'egg_alt',
  meat: 'set_meal',
  bakery: 'bakery_dining',
  pantry: 'kitchen',
  beverages: 'local_cafe',
  frozen: 'ac_unit',
  household: 'cleaning_services',
  snacks: 'cookie',
};

export function ProductPlaceholder({ categoryId = 'other', className = '' }: ProductPlaceholderProps) {
  const imageUrl = categoryImages[categoryId];
  const icon = categoryIcons[categoryId] ?? 'shopping_bag';
  const categoryLabel = categoryId.charAt(0).toUpperCase() + categoryId.slice(1);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-surface-active/20 ${className}`}>
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt={categoryLabel}
            className="w-full h-full object-cover opacity-40"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-active/20 to-surface-active/5">
          <span className="material-symbols-outlined text-5xl text-primary/30">{icon}</span>
        </div>
      )}
      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-surface/80 backdrop-blur-sm text-text-muted text-[10px] font-medium uppercase tracking-wider">
        {categoryLabel}
      </div>
    </div>
  );
}

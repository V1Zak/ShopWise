import { useProductsStore } from '@/store/products-store';

interface CompareFloatingBarProps {
  onCompare?: () => void;
}

export function CompareFloatingBar({ onCompare }: CompareFloatingBarProps) {
  const compareList = useProductsStore((s) => s.compareList);

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onCompare}
        className="bg-primary hover:bg-primary/90 text-black font-bold py-3 px-6 rounded-full shadow-lg shadow-primary/20 cursor-pointer flex items-center gap-3 transition-all transform hover:scale-105"
      >
        <span aria-hidden="true" className="material-symbols-outlined">compare_arrows</span>
        <span>Compare ({compareList.length} Items)</span>
      </button>
    </div>
  );
}

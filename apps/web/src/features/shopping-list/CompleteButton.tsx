import { useNavigate } from 'react-router-dom';
import { useListsStore } from '@/store/lists-store';

export function CompleteButton() {
  const navigate = useNavigate();
  const activeListId = useListsStore((s) => s.activeListId);

  return (
    <div className="p-6 border-t border-border-dark bg-surface-darker">
      <button
        onClick={() => navigate(`/briefing/${activeListId}`)}
        className="w-full bg-primary hover:bg-[#10c96d] text-background-dark font-bold text-lg h-14 rounded-lg flex items-center justify-center gap-3 transition-colors shadow-lg shadow-primary/20"
      >
        <span className="material-symbols-outlined">shopping_bag</span>
        Complete Shopping Trip
      </button>
    </div>
  );
}

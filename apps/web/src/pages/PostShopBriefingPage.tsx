import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BriefingHeader } from '@/features/briefing/BriefingHeader';
import { BriefingKPIs } from '@/features/briefing/BriefingKPIs';
import { SpendVelocityChart } from '@/features/briefing/SpendVelocityChart';
import { PriceSpikeAlerts } from '@/features/briefing/PriceSpikeAlerts';
import { BriefingCategoryBreakdown } from '@/features/briefing/BriefingCategoryBreakdown';
import { ReceiptUploadZone } from '@/features/briefing/ReceiptUploadZone';
import { useTripsStore } from '@/store/trips-store';

export function PostShopBriefingPage() {
  const { id } = useParams<{ id: string }>();
  const fetchTripById = useTripsStore((s) => s.fetchTripById);
  const currentTrip = useTripsStore((s) => s.currentTrip);
  const isLoading = useTripsStore((s) => s.isLoading);

  const [isEditing, setIsEditing] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchTripById(id);
    }
  }, [id, fetchTripById]);

  const handleToggleEditing = useCallback(() => {
    setIsEditing((prev) => !prev);
  }, []);

  const handleScrollToReceipt = useCallback(() => {
    receiptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  if (isLoading && !currentTrip) {
    return (
      <div className="p-6 md:p-8 overflow-y-auto">
        <div className="max-w-[1440px] mx-auto flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
            <p className="text-gray-400">Loading briefing...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentTrip) {
    return (
      <div className="p-6 md:p-8 overflow-y-auto">
        <div className="max-w-[1440px] mx-auto flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-gray-500">error_outline</span>
            <p className="text-gray-400">Trip not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 overflow-y-auto">
      <div className="max-w-[1440px] mx-auto">
        <BriefingHeader
          storeName={currentTrip.storeName}
          date={currentTrip.date}
          itemCount={currentTrip.itemCount}
          totalSpent={currentTrip.totalSpent}
          totalSaved={currentTrip.totalSaved}
          isEditing={isEditing}
          onToggleEditing={handleToggleEditing}
          onScrollToReceipt={handleScrollToReceipt}
        />
        <BriefingKPIs />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <SpendVelocityChart />
            <div ref={receiptRef}>
              <ReceiptUploadZone tripId={currentTrip.id} />
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-6">
            <PriceSpikeAlerts />
            <BriefingCategoryBreakdown />
          </div>
        </div>
      </div>
    </div>
  );
}

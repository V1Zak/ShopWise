import { BriefingHeader } from '@/features/briefing/BriefingHeader';
import { BriefingKPIs } from '@/features/briefing/BriefingKPIs';
import { SpendVelocityChart } from '@/features/briefing/SpendVelocityChart';
import { PriceSpikeAlerts } from '@/features/briefing/PriceSpikeAlerts';
import { BriefingCategoryBreakdown } from '@/features/briefing/BriefingCategoryBreakdown';
import { ReceiptUploadZone } from '@/features/briefing/ReceiptUploadZone';

export function PostShopBriefingPage() {
  return (
    <div className="p-6 md:p-8 overflow-y-auto">
      <div className="max-w-[1440px] mx-auto">
        <BriefingHeader />
        <BriefingKPIs />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <SpendVelocityChart />
            <ReceiptUploadZone />
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

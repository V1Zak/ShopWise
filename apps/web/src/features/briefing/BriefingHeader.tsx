export function BriefingHeader() {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider mb-1">
          <span className="material-symbols-outlined text-sm">verified</span>
          Mission Complete
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Post-Shop Briefing</h1>
        <p className="text-gray-400 text-lg mt-1 flex items-center gap-2 flex-wrap">
          Whole Foods Market <span className="w-1 h-1 bg-gray-600 rounded-full" /> Oct 24, 2023 <span className="w-1 h-1 bg-gray-600 rounded-full" /> 14 Items
        </p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <button className="flex items-center justify-center h-10 px-5 rounded-lg bg-accent-green hover:bg-[#2c5842] text-white text-sm font-medium transition-colors">
          Edit Prices
        </button>
        <button className="flex items-center justify-center h-10 px-5 rounded-lg bg-accent-green hover:bg-[#2c5842] text-white text-sm font-medium transition-colors">
          Share Summary
        </button>
        <button className="flex items-center justify-center h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-background-dark text-sm font-bold transition-colors shadow-[0_0_15px_rgba(19,236,128,0.3)]">
          <span className="material-symbols-outlined text-[20px] mr-2">upload_file</span>
          Verify Receipt
        </button>
      </div>
    </header>
  );
}

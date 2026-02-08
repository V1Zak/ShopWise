export function ReceiptUploadZone() {
  return (
    <div className="rounded-xl bg-surface-darker border-2 border-dashed border-border-dark p-8 flex flex-col items-center justify-center text-center gap-3 hover:border-primary/50 hover:bg-surface-dark transition-all cursor-pointer group">
      <div className="h-12 w-12 rounded-full bg-accent-green group-hover:bg-primary/20 flex items-center justify-center transition-colors">
        <span className="material-symbols-outlined text-2xl text-gray-400 group-hover:text-primary transition-colors">receipt_long</span>
      </div>
      <div>
        <p className="text-white font-bold text-lg">Verification Required</p>
        <p className="text-gray-400 text-sm">Drag and drop your receipt here, or click to browse.</p>
      </div>
    </div>
  );
}

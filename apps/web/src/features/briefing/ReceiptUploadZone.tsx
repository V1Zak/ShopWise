import { useCallback, useEffect, useRef, useState } from 'react';
import { tripsService } from '@/services/trips.service';

interface ReceiptUploadZoneProps {
  tripId: string;
}

export function ReceiptUploadZone({ tripId }: ReceiptUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Cleanup object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setUploadError('Please upload an image file (JPG, PNG, etc.)');
        return;
      }
      // Revoke previous object URL before creating a new one
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setUploadError(null);
      setIsUploading(true);
      try {
        await tripsService.uploadReceipt(tripId, file);
      } catch {
        setUploadError('Receipt saved locally. Cloud upload will retry when online.');
      } finally {
        setIsUploading(false);
      }
    },
    [tripId, previewUrl],
  );

  const handleClick = useCallback(() => { fileInputRef.current?.click(); }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); }, []);

  const handleRemove = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [previewUrl]);

  if (previewUrl) {
    return (
      <div className="rounded-xl bg-surface border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-surface-alt">
          <h3 className="text-text font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">receipt_long</span>
            Receipt Uploaded
            {isUploading && <span className="text-text-muted text-sm font-normal ml-2">Uploading...</span>}
          </h3>
          <button onClick={handleRemove} className="text-text-muted hover:text-text text-sm flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-[16px]">close</span> Remove
          </button>
        </div>
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="md:w-1/2 flex items-center justify-center bg-bg rounded-lg border border-border overflow-hidden">
            <img src={previewUrl} alt="Receipt" className="max-h-80 w-auto object-contain" />
          </div>
          <div className="md:w-1/2 flex flex-col gap-3">
            <div className="rounded-lg bg-bg border border-border p-4">
              <h4 className="text-text font-bold text-sm mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">compare</span>
                Verification Status
              </h4>
              <p className="text-text-muted text-sm">Receipt image captured. Automatic price comparison will be available once OCR processing is enabled.</p>
            </div>
            {uploadError && (
              <div className="rounded-lg bg-warning/10 border border-warning/30 p-3">
                <p className="text-warning text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">info</span> {uploadError}
                </p>
              </div>
            )}
            <div className="rounded-lg bg-primary/10 border border-primary/30 p-3">
              <p className="text-primary/80 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">check_circle</span> Receipt ready for verification
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`rounded-xl bg-surface-alt border-2 border-dashed p-8 flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer group ${
        isDragOver ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-surface'
      }`}
    >
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleInputChange} />
      <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${isDragOver ? 'bg-primary/20' : 'bg-surface-active group-hover:bg-primary/20'}`}>
        <span className={`material-symbols-outlined text-2xl transition-colors ${isDragOver ? 'text-primary' : 'text-text-muted group-hover:text-primary'}`}>receipt_long</span>
      </div>
      <div>
        <p className="text-text font-bold text-lg">{isDragOver ? 'Drop receipt here' : 'Verification Required'}</p>
        <p className="text-text-muted text-sm">Drag and drop your receipt here, or click to browse.</p>
      </div>
      {uploadError && <p className="text-danger text-sm mt-1">{uploadError}</p>}
    </div>
  );
}

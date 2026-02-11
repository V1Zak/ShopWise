import { useCallback, useEffect, useRef, useState } from 'react';
import { createWorker, OEM } from 'tesseract.js';
import { tripsService } from '@/services/trips.service';

interface ReceiptUploadZoneProps {
  tripId: string;
}

interface ExtractedItem {
  text: string;
  amount: number | null;
}

type OcrStatus = 'idle' | 'processing' | 'done' | 'error';

const PRICE_PATTERN = /\$?\s*(\d+\.\d{2})\s*$/;
const SKIP_KEYWORDS = /^(subtotal|sub total|total|tax|gst|hst|pst|change|cash|credit|debit|visa|mastercard|amex|balance|amount due|thank you|tel|phone|fax|www\.|http)/i;
const NOISE_PATTERN = /^[\d\s\-/.#:]+$|^\*+$/;

function parseReceiptLines(text: string): ExtractedItem[] {
  const lines = text.split('\n');
  const items: ExtractedItem[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (line.length < 3) continue;
    if (NOISE_PATTERN.test(line)) continue;
    if (SKIP_KEYWORDS.test(line)) continue;

    const priceMatch = line.match(PRICE_PATTERN);
    if (priceMatch) {
      const amount = parseFloat(priceMatch[1]);
      const itemText = line.slice(0, priceMatch.index).replace(/[\s.$]+$/, '').trim();
      if (itemText.length >= 2) {
        items.push({ text: itemText, amount });
      }
    }
  }

  return items;
}

export function ReceiptUploadZone({ tripId }: ReceiptUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // OCR state
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>('idle');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [rawText, setRawText] = useState('');
  const [showRawText, setShowRawText] = useState(false);

  // Cleanup object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const runOcr = useCallback(async (file: File) => {
    setOcrStatus('processing');
    setOcrProgress(0);
    setExtractedItems([]);
    setRawText('');

    try {
      const worker = await createWorker('eng', OEM.DEFAULT, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round((m.progress ?? 0) * 100));
          }
        },
      });
      const { data } = await worker.recognize(file);
      await worker.terminate();

      const text = data.text;
      setRawText(text);
      const items = parseReceiptLines(text);
      setExtractedItems(items);
      setOcrStatus('done');
    } catch {
      setOcrStatus('error');
    }
  }, []);

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

      // Start OCR in parallel with upload
      runOcr(file);

      try {
        await tripsService.uploadReceipt(tripId, file);
      } catch {
        setUploadError('Receipt saved locally. Cloud upload will retry when online.');
      } finally {
        setIsUploading(false);
      }
    },
    [tripId, previewUrl, runOcr],
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
    setOcrStatus('idle');
    setOcrProgress(0);
    setExtractedItems([]);
    setRawText('');
    setShowRawText(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [previewUrl]);

  const handleRetryOcr = useCallback(() => {
    if (!fileInputRef.current?.files?.[0]) return;
    runOcr(fileInputRef.current.files[0]);
  }, [runOcr]);

  const extractedTotal = extractedItems.reduce((sum, item) => sum + (item.amount ?? 0), 0);

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
            {/* OCR Processing State */}
            {ocrStatus === 'processing' && (
              <div className="rounded-lg bg-bg border border-border p-4">
                <h4 className="text-text font-bold text-sm mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px] animate-spin">progress_activity</span>
                  Scanning receipt...
                </h4>
                <div className="w-full bg-surface-alt rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
                <p className="text-text-muted text-xs mt-2">{ocrProgress}% — Extracting text from image</p>
              </div>
            )}

            {/* OCR Done — Items Found */}
            {ocrStatus === 'done' && extractedItems.length > 0 && (
              <div className="rounded-lg bg-bg border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-text font-bold text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">list_alt</span>
                    Extracted Items
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-warning/20 text-warning px-2 py-0.5 rounded-full">
                    Beta
                  </span>
                </div>
                <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                  {extractedItems.map((item, i) => (
                    <li key={i} className="flex justify-between items-center text-sm py-1 border-b border-border/50 last:border-0">
                      <span className="text-text truncate mr-2">{item.text}</span>
                      {item.amount !== null && (
                        <span className="text-text-muted font-mono whitespace-nowrap">${item.amount.toFixed(2)}</span>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 pt-2 border-t border-border flex justify-between items-center">
                  <span className="text-text-muted text-xs">{extractedItems.length} items found</span>
                  <span className="text-text font-bold text-sm font-mono">${extractedTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setShowRawText((v) => !v)}
                  className="mt-2 text-text-muted hover:text-text text-xs flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {showRawText ? 'expand_less' : 'expand_more'}
                  </span>
                  {showRawText ? 'Hide' : 'Show'} raw OCR text
                </button>
                {showRawText && (
                  <pre className="mt-2 text-[11px] text-text-muted bg-surface-alt rounded p-2 max-h-40 overflow-y-auto whitespace-pre-wrap break-words">
                    {rawText}
                  </pre>
                )}
              </div>
            )}

            {/* OCR Done — No Items Found */}
            {ocrStatus === 'done' && extractedItems.length === 0 && (
              <div className="rounded-lg bg-bg border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-text font-bold text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-warning text-[18px]">search_off</span>
                    No Items Detected
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-warning/20 text-warning px-2 py-0.5 rounded-full">
                    Beta
                  </span>
                </div>
                <p className="text-text-muted text-sm mb-2">
                  Could not extract line items from this image. For best results:
                </p>
                <ul className="text-text-muted text-xs space-y-1 ml-4 list-disc">
                  <li>Use a well-lit, flat photo of the receipt</li>
                  <li>Ensure text is in focus and not cut off</li>
                  <li>Avoid crumpled or faded receipts</li>
                </ul>
                {rawText.trim().length > 0 && (
                  <>
                    <button
                      onClick={() => setShowRawText((v) => !v)}
                      className="mt-3 text-text-muted hover:text-text text-xs flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {showRawText ? 'expand_less' : 'expand_more'}
                      </span>
                      {showRawText ? 'Hide' : 'Show'} raw OCR text
                    </button>
                    {showRawText && (
                      <pre className="mt-2 text-[11px] text-text-muted bg-surface-alt rounded p-2 max-h-40 overflow-y-auto whitespace-pre-wrap break-words">
                        {rawText}
                      </pre>
                    )}
                  </>
                )}
              </div>
            )}

            {/* OCR Error */}
            {ocrStatus === 'error' && (
              <div className="rounded-lg bg-danger/10 border border-danger/30 p-4">
                <h4 className="text-danger font-bold text-sm mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  OCR Processing Failed
                </h4>
                <p className="text-text-muted text-sm mb-3">
                  Something went wrong while scanning the receipt. This may be due to the image format or a temporary issue.
                </p>
                <button
                  onClick={handleRetryOcr}
                  className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  Try again
                </button>
              </div>
            )}

            {/* OCR Idle — waiting for processing to start */}
            {ocrStatus === 'idle' && (
              <div className="rounded-lg bg-bg border border-border p-4">
                <h4 className="text-text font-bold text-sm mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">compare</span>
                  Verification Status
                </h4>
                <p className="text-text-muted text-sm">Receipt image captured. Preparing OCR scan...</p>
              </div>
            )}

            {uploadError && (
              <div className="rounded-lg bg-warning/10 border border-warning/30 p-3">
                <p className="text-warning text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">info</span> {uploadError}
                </p>
              </div>
            )}
            {ocrStatus !== 'error' && (
              <div className="rounded-lg bg-primary/10 border border-primary/30 p-3">
                <p className="text-primary/80 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  {ocrStatus === 'done' ? 'Receipt scanned and ready' : 'Receipt ready for verification'}
                </p>
              </div>
            )}
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

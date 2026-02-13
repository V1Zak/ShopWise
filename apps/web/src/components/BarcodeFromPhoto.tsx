import { useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface BarcodeFromPhotoProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeFromPhoto({ onDetected, onClose }: BarcodeFromPhotoProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detected, setDetected] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    setError(null);
    setDetected(null);
    setScanning(true);

    try {
      const reader = new BrowserMultiFormatReader();
      const img = new Image();
      img.src = url;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
      });

      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const luminanceSource = new (await import('@zxing/library')).HTMLCanvasElementLuminanceSource(canvas);
      const binaryBitmap = new (await import('@zxing/library')).BinaryBitmap(
        new (await import('@zxing/library')).HybridBinarizer(luminanceSource)
      );

      const result = reader.decodeBitmap(binaryBitmap);
      setDetected(result.getText());
      setScanning(false);
    } catch {
      setError('No barcode found in this image. Try a clearer photo.');
      setScanning(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
        <h3 className="text-text font-bold text-lg">Scan from Photo</h3>
        <button onClick={onClose} className="text-text hover:text-primary transition-colors">
          <span aria-hidden="true" className="material-symbols-outlined text-[28px]">close</span>
        </button>
      </div>

      <div className="w-full max-w-md flex flex-col items-center gap-6 mt-16">
        {/* Preview area */}
        {preview ? (
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-border">
            <img src={preview} alt="Scanned" className="w-full h-full object-contain bg-surface" />
            {scanning && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-text text-sm">Scanning for barcodes...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors bg-surface flex flex-col items-center justify-center gap-4"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-text-muted text-[48px]">add_photo_alternate</span>
            <div className="text-center">
              <p className="text-text font-medium">Select a photo</p>
              <p className="text-text-muted text-sm">Choose an image containing a barcode</p>
            </div>
          </button>
        )}

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Result */}
        {detected && (
          <div className="w-full rounded-lg border border-primary/30 bg-primary/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="material-symbols-outlined text-primary text-[24px]">qr_code</span>
                <div>
                  <p className="text-text font-medium">Barcode detected</p>
                  <p className="text-text-muted text-sm font-mono">{detected}</p>
                </div>
              </div>
              <button
                onClick={() => onDetected(detected)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-text-inv text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                Look up
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="w-full rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="material-symbols-outlined text-yellow-400 text-[24px]">warning</span>
              <p className="text-yellow-200 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-active text-text text-sm font-medium hover:bg-surface-active/80 transition-colors"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">photo_library</span>
            {preview ? 'Try another photo' : 'Choose photo'}
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
}

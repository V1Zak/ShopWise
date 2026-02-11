import { useRef, useState } from 'react';
import { storageService } from '@/services/storage.service';

interface PhotoCaptureProps {
  productId: string;
  currentImageUrl?: string;
  onUploaded: (url: string) => void;
}

export function PhotoCapture({ productId, currentImageUrl, onUploaded }: PhotoCaptureProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    setPreview(URL.createObjectURL(file));
    setError(null);
    setUploading(true);

    try {
      const url = await storageService.uploadProductImage(productId, file);
      await storageService.updateProductImageUrl(productId, url);
      onUploaded(url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Preview */}
      <div
        onClick={() => fileRef.current?.click()}
        className="relative group cursor-pointer w-full aspect-square max-w-[200px] rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors bg-surface overflow-hidden flex items-center justify-center"
      >
        {preview ? (
          <>
            <img src={preview} alt="Product" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[32px]">photo_camera</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-text-muted">
            <span className="material-symbols-outlined text-[36px]">add_a_photo</span>
            <span className="text-xs font-medium">Add Photo</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-active text-text text-xs font-medium hover:bg-surface-active/80 transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px]">photo_camera</span>
          {preview ? 'Change' : 'Camera'}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}
    </div>
  );
}

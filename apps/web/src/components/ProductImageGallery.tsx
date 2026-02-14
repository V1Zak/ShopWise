import { useState, useRef, useEffect } from 'react';
import type { ProductImage } from '@shopwise/shared';
import { storageService } from '@/services/storage.service';

interface ProductImageGalleryProps {
  productId: string;
  onPrimaryChanged?: (url: string) => void;
}

export function ProductImageGallery({ productId, onPrimaryChanged }: ProductImageGalleryProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadImages();
  }, [productId]);

  const loadImages = async () => {
    try {
      const imgs = await storageService.getProductImages(productId);
      setImages(imgs);
    } catch {
      // Table may not exist yet
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    setUploading(true);
    try {
      const newImage = await storageService.addProductImage(productId, file);
      setImages((prev) => [...prev, newImage]);
      if (newImage.isPrimary) {
        onPrimaryChanged?.(newImage.url);
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (image: ProductImage) => {
    try {
      await storageService.deleteProductImage(productId, image.id, image.url);
      setImages((prev) => prev.filter((i) => i.id !== image.id));
      if (image.isPrimary) {
        // Reload to get updated primary
        await loadImages();
      }
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  };

  const handleSetPrimary = async (image: ProductImage) => {
    try {
      await storageService.setPrimaryImage(productId, image.id);
      setImages((prev) =>
        prev.map((i) => ({ ...i, isPrimary: i.id === image.id })),
      );
      onPrimaryChanged?.(image.url);
    } catch (err) {
      console.error('Failed to set primary image:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text">Product Images</h4>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-active text-text text-xs font-medium hover:bg-primary hover:text-text-inv transition-colors disabled:opacity-50"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
          {uploading ? 'Uploading...' : 'Add Image'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleAddImage}
          className="hidden"
        />
      </div>

      {images.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface/50 p-6 text-center">
          <span aria-hidden="true" className="material-symbols-outlined text-3xl text-text-muted/40">photo_library</span>
          <p className="text-xs text-text-muted mt-2">No images yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image) => (
            <div key={image.id} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
              <img
                src={image.url}
                alt="Product"
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setLightboxUrl(image.url)}
              />
              {image.isPrimary && (
                <div className="absolute top-1 left-1 bg-primary text-text-inv text-[9px] font-bold px-1.5 py-0.5 rounded">
                  Primary
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!image.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(image)}
                    className="p-1.5 rounded-full bg-white/20 hover:bg-primary hover:text-text-inv text-white transition-colors"
                    title="Set as primary"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-[16px]">star</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(image)}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-red-600 text-white transition-colors"
                  title="Delete"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img src={lightboxUrl} alt="Product" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-surface border border-border flex items-center justify-center text-text hover:bg-surface-active transition-colors"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

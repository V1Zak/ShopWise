import { supabase } from '@/lib/supabase';
import type { ProductImage } from '@shopwise/shared';

const BUCKET = 'product-images';
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_DIMENSION = 800;

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
        'image/jpeg',
        0.85,
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export const storageService = {
  async uploadProductImage(productId: string, file: File): Promise<string> {
    if (file.size > MAX_SIZE * 2) {
      throw new Error('File too large. Maximum 4MB before compression.');
    }

    const blob = await compressImage(file);
    const ext = 'jpg';
    const path = `${productId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },

  async updateProductImageUrl(productId: string, imageUrl: string) {
    const { error } = await supabase
      .from('products')
      .update({ image_url: imageUrl })
      .eq('id', productId);

    if (error) throw error;
  },

  async getProductImages(productId: string): Promise<ProductImage[]> {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order');

    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id,
      productId: row.product_id,
      url: row.url,
      isPrimary: row.is_primary,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    }));
  },

  async addProductImage(productId: string, file: File): Promise<ProductImage> {
    const url = await storageService.uploadProductImage(productId, file);

    // Check if this is the first image (make it primary)
    const { count } = await supabase
      .from('product_images')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId);

    const isPrimary = (count ?? 0) === 0;

    const { data, error } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        url,
        is_primary: isPrimary,
        sort_order: (count ?? 0),
      })
      .select()
      .single();

    if (error) throw error;

    // If it's the first image, also set it as the product's main image
    if (isPrimary) {
      await storageService.updateProductImageUrl(productId, url);
    }

    return {
      id: data.id,
      productId: data.product_id,
      url: data.url,
      isPrimary: data.is_primary,
      sortOrder: data.sort_order,
      createdAt: data.created_at,
    };
  },

  async deleteProductImage(productId: string, imageId: string, imageUrl: string) {
    // Extract storage path from URL
    const urlParts = imageUrl.split(`${BUCKET}/`);
    if (urlParts.length > 1) {
      const path = urlParts[1];
      await supabase.storage.from(BUCKET).remove([path]);
    }

    const { data: deleted, error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId)
      .select()
      .single();

    if (error) throw error;

    // If the deleted image was primary, promote the next one
    if (deleted.is_primary) {
      const { data: remaining } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order')
        .limit(1);

      if (remaining && remaining.length > 0) {
        await supabase
          .from('product_images')
          .update({ is_primary: true })
          .eq('id', remaining[0].id);
        await storageService.updateProductImageUrl(productId, remaining[0].url);
      } else {
        // No images left, clear the product image
        await supabase
          .from('products')
          .update({ image_url: null })
          .eq('id', productId);
      }
    }
  },

  async setPrimaryImage(productId: string, imageId: string) {
    // Clear all primary flags for this product
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId);

    // Set the new primary
    const { data, error } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId)
      .select()
      .single();

    if (error) throw error;

    // Update the product's main image_url
    await storageService.updateProductImageUrl(productId, data.url);
  },
};

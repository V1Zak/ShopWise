import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();
const mockFromProducts = vi.fn();
const mockFromProductImages = vi.fn();
const mockRemove = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
        remove: mockRemove,
      }),
    },
    from: (table: string) => {
      if (table === 'products') return mockFromProducts();
      if (table === 'product_images') return mockFromProductImages();
      return {};
    },
  },
}));

// Import after mocks
const { storageService } = await import('@/services/storage.service');

describe('storageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://storage.test/prod-1/123.jpg' } });
  });

  describe('uploadProductImage', () => {
    it('compresses and uploads image', async () => {
      // Create a small test file
      const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });

      // Mock canvas for compression
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: () => ({
          drawImage: vi.fn(),
        }),
        toBlob: (cb: (blob: Blob | null) => void) => cb(new Blob(['compressed'], { type: 'image/jpeg' })),
      };
      const origCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
        return origCreateElement(tag);
      });

      // Mock Image constructor — must use a function (not arrow) to support `new`
      const OrigImage = globalThis.Image;
      globalThis.Image = function MockImage(this: Record<string, unknown>) {
        const img = this;
        img.width = 400;
        img.height = 300;
        img.onload = null;
        img.onerror = null;
        setTimeout(() => (img.onload as (() => void) | null)?.(), 0);
        return img;
      } as unknown as typeof Image;

      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');

      const url = await storageService.uploadProductImage('prod-1', file);
      expect(url).toBe('https://storage.test/prod-1/123.jpg');
      expect(mockUpload).toHaveBeenCalled();

      // Restore
      globalThis.Image = OrigImage;
    });

    it('rejects files over 4MB', async () => {
      // Create a large file (>4MB)
      const largeContent = new ArrayBuffer(5 * 1024 * 1024);
      const file = new File([largeContent], 'huge.jpg', { type: 'image/jpeg' });

      await expect(storageService.uploadProductImage('prod-1', file)).rejects.toThrow('File too large');
    });
  });

  describe('updateProductImageUrl', () => {
    it('updates product image_url in products table', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockFromProducts.mockReturnValue({ update: mockUpdate });

      await storageService.updateProductImageUrl('prod-1', 'https://storage.test/new.jpg');
      expect(mockUpdate).toHaveBeenCalledWith({ image_url: 'https://storage.test/new.jpg' });
      expect(mockEq).toHaveBeenCalledWith('id', 'prod-1');
    });
  });

  describe('getProductImages', () => {
    it('fetches and transforms images', async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [
          { id: 'img-1', product_id: 'prod-1', url: 'https://test.jpg', is_primary: true, sort_order: 0, created_at: '2026-01-01' },
        ],
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFromProductImages.mockReturnValue({ select: mockSelect });

      const images = await storageService.getProductImages('prod-1');
      expect(images).toHaveLength(1);
      expect(images[0]).toEqual({
        id: 'img-1',
        productId: 'prod-1',
        url: 'https://test.jpg',
        isPrimary: true,
        sortOrder: 0,
        createdAt: '2026-01-01',
      });
    });
  });

  describe('setPrimaryImage', () => {
    it('clears old primary and sets new one', async () => {
      const mockEqUpdate = vi.fn().mockResolvedValue({ error: null });
      const mockUpdateAll = vi.fn().mockReturnValue({ eq: mockEqUpdate });

      const mockSelectSingle = vi.fn().mockResolvedValue({
        data: { id: 'img-2', url: 'https://storage.test/2.jpg', is_primary: true },
        error: null,
      });
      const mockEqSet = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: mockSelectSingle }) });
      const mockUpdateSet = vi.fn().mockReturnValue({ eq: mockEqSet });

      // First call: clear all primary flags
      // Second call: set new primary
      let callCount = 0;
      mockFromProductImages.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return { update: mockUpdateAll };
        return { update: mockUpdateSet };
      });

      // Also need to mock the products table update
      const mockProdEq = vi.fn().mockResolvedValue({ error: null });
      const mockProdUpdate = vi.fn().mockReturnValue({ eq: mockProdEq });
      mockFromProducts.mockReturnValue({ update: mockProdUpdate });

      await storageService.setPrimaryImage('prod-1', 'img-2');
      expect(mockUpdateAll).toHaveBeenCalledWith({ is_primary: false });
    });
  });
});

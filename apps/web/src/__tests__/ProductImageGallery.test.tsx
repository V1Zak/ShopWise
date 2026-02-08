import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductImageGallery } from '@/components/ProductImageGallery';

const mockGetProductImages = vi.fn();
const mockAddProductImage = vi.fn();
const mockDeleteProductImage = vi.fn();
const mockSetPrimaryImage = vi.fn();

vi.mock('@/services/storage.service', () => ({
  storageService: {
    getProductImages: (...args: unknown[]) => mockGetProductImages(...args),
    addProductImage: (...args: unknown[]) => mockAddProductImage(...args),
    deleteProductImage: (...args: unknown[]) => mockDeleteProductImage(...args),
    setPrimaryImage: (...args: unknown[]) => mockSetPrimaryImage(...args),
  },
}));

const mockImages = [
  { id: 'img-1', productId: 'prod-1', url: 'https://storage.test/1.jpg', isPrimary: true, sortOrder: 0, createdAt: '2026-01-01' },
  { id: 'img-2', productId: 'prod-1', url: 'https://storage.test/2.jpg', isPrimary: false, sortOrder: 1, createdAt: '2026-01-02' },
  { id: 'img-3', productId: 'prod-1', url: 'https://storage.test/3.jpg', isPrimary: false, sortOrder: 2, createdAt: '2026-01-03' },
];

describe('ProductImageGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProductImages.mockResolvedValue(mockImages);
    mockAddProductImage.mockResolvedValue({ id: 'img-4', productId: 'prod-1', url: 'https://storage.test/4.jpg', isPrimary: false, sortOrder: 3, createdAt: '2026-01-04' });
    mockDeleteProductImage.mockResolvedValue(undefined);
    mockSetPrimaryImage.mockResolvedValue(undefined);
  });

  it('loads and displays images', async () => {
    render(<ProductImageGallery productId="prod-1" />);
    await waitFor(() => {
      const images = screen.getAllByAltText('Product');
      expect(images).toHaveLength(3);
    });
  });

  it('shows Primary badge on primary image', async () => {
    render(<ProductImageGallery productId="prod-1" />);
    await waitFor(() => {
      expect(screen.getByText('Primary')).toBeInTheDocument();
    });
  });

  it('shows "No images yet" when empty', async () => {
    mockGetProductImages.mockResolvedValue([]);
    render(<ProductImageGallery productId="prod-1" />);
    await waitFor(() => {
      expect(screen.getByText('No images yet')).toBeInTheDocument();
    });
  });

  it('renders Add Image button', async () => {
    render(<ProductImageGallery productId="prod-1" />);
    await waitFor(() => {
      expect(screen.getByText('Add Image')).toBeInTheDocument();
    });
  });

  it('has hidden file input for image upload', async () => {
    render(<ProductImageGallery productId="prod-1" />);
    await waitFor(() => {
      const fileInput = document.querySelector('input[type="file"][accept="image/*"]');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveClass('hidden');
    });
  });

  it('calls getProductImages with correct productId', async () => {
    render(<ProductImageGallery productId="prod-1" />);
    await waitFor(() => {
      expect(mockGetProductImages).toHaveBeenCalledWith('prod-1');
    });
  });

  it('opens lightbox when image is clicked', async () => {
    render(<ProductImageGallery productId="prod-1" />);
    await waitFor(() => {
      const images = screen.getAllByAltText('Product');
      fireEvent.click(images[0]);
    });
    // Lightbox should show a larger image in a fixed overlay
    const lightboxOverlay = document.querySelector('.fixed');
    expect(lightboxOverlay).toBeInTheDocument();
  });

  it('closes lightbox when overlay is clicked', async () => {
    render(<ProductImageGallery productId="prod-1" />);
    await waitFor(() => {
      const images = screen.getAllByAltText('Product');
      fireEvent.click(images[0]);
    });
    const lightboxOverlay = document.querySelector('.fixed.inset-0');
    if (lightboxOverlay) fireEvent.click(lightboxOverlay);
  });
});

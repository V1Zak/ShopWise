import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddProductForm } from '@/components/AddProductForm';

const mockCreateProduct = vi.fn();
const mockUploadProductImage = vi.fn();
const mockUpdateProductImageUrl = vi.fn();
const mockAddProductImage = vi.fn();
const mockOnProductCreated = vi.fn();
const mockOnClose = vi.fn();

vi.mock('@/services/products.service', () => ({
  productsService: {
    createProduct: (...args: unknown[]) => mockCreateProduct(...args),
  },
}));

vi.mock('@/services/storage.service', () => ({
  storageService: {
    uploadProductImage: (...args: unknown[]) => mockUploadProductImage(...args),
    updateProductImageUrl: (...args: unknown[]) => mockUpdateProductImageUrl(...args),
    addProductImage: (...args: unknown[]) => mockAddProductImage(...args),
  },
}));

describe('AddProductForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateProduct.mockResolvedValue({
      id: 'new-prod-1',
      name: 'Test Product',
      barcode: '123456',
      categoryId: 'other',
      unit: 'each',
      averagePrice: 3.99,
      storePrices: [],
      priceHistory: [],
      volatility: 'stable',
      createdAt: '2026-01-01',
    });
    mockUploadProductImage.mockResolvedValue('https://storage.test/image.jpg');
    mockUpdateProductImageUrl.mockResolvedValue(undefined);
    mockAddProductImage.mockResolvedValue({ id: 'img-1', url: 'https://storage.test/image.jpg' });
  });

  function renderForm() {
    return render(
      <AddProductForm
        barcode="123456"
        onProductCreated={mockOnProductCreated}
        onClose={mockOnClose}
      />,
    );
  }

  it('renders barcode display', () => {
    renderForm();
    expect(screen.getByText('123456')).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    renderForm();
    expect(screen.getByLabelText(/Product Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Brand/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Unit/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Price/)).toBeInTheDocument();
  });

  it('renders photo upload area', () => {
    renderForm();
    expect(screen.getByText('Tap to add photo')).toBeInTheDocument();
  });

  it('has hidden file input for camera/gallery', () => {
    renderForm();
    const fileInput = document.querySelector('input[type="file"][accept="image/*"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveClass('hidden');
  });

  it('disables submit when name is empty', () => {
    renderForm();
    const submitBtn = screen.getByText('Add Product').closest('button')!;
    expect(submitBtn).toBeDisabled();
  });

  it('disables submit when price is empty', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/Product Name/), { target: { value: 'Milk' } });
    const submitBtn = screen.getByText('Add Product').closest('button')!;
    expect(submitBtn).toBeDisabled();
  });

  it('enables submit when name and price are valid', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/Product Name/), { target: { value: 'Milk' } });
    fireEvent.change(screen.getByLabelText(/Price/), { target: { value: '3.99' } });
    const submitBtn = screen.getByText('Add Product').closest('button')!;
    expect(submitBtn).not.toBeDisabled();
  });

  it('calls createProduct on submit without image', async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/Product Name/), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByLabelText(/Price/), { target: { value: '3.99' } });
    fireEvent.click(screen.getByText('Add Product').closest('button')!);

    await waitFor(() => {
      expect(mockCreateProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          barcode: '123456',
          name: 'Test Product',
          averagePrice: 3.99,
        }),
      );
      expect(mockOnProductCreated).toHaveBeenCalled();
    });
  });

  it('does not call image upload when no image selected', async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/Product Name/), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Price/), { target: { value: '1.99' } });
    fireEvent.click(screen.getByText('Add Product').closest('button')!);

    await waitFor(() => {
      expect(mockUploadProductImage).not.toHaveBeenCalled();
    });
  });

  it('closes form when Cancel is clicked', () => {
    renderForm();
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes form when X button is clicked', () => {
    renderForm();
    const closeBtn = screen.getAllByText('close')[0].closest('button')!;
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows error when createProduct fails', async () => {
    mockCreateProduct.mockRejectedValueOnce(new Error('DB error'));
    renderForm();
    fireEvent.change(screen.getByLabelText(/Product Name/), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Price/), { target: { value: '1.99' } });
    fireEvent.click(screen.getByText('Add Product').closest('button')!);

    await waitFor(() => {
      expect(screen.getByText('Failed to add product. Please try again.')).toBeInTheDocument();
    });
  });
});

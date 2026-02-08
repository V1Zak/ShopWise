import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductCard } from '@/features/catalog/ProductCard';
import type { Product } from '@shopwise/shared';

const mockToggleCompare = vi.fn();
const mockAddItem = vi.fn().mockResolvedValue({ id: 'item-1', list_id: 'list-1' });

vi.mock('@/store/products-store', () => ({
  useProductsStore: (selector: (s: Record<string, unknown>) => unknown) => {
    const state = {
      toggleCompare: mockToggleCompare,
      compareList: [],
    };
    return selector(state);
  },
}));

vi.mock('@/store/lists-store', () => ({
  useListsStore: (selector: (s: Record<string, unknown>) => unknown) => {
    const state = {
      lists: [
        { id: 'list-1', title: 'Weekly Groceries', isTemplate: false },
        { id: 'list-2', title: 'Party Shopping', isTemplate: false },
        { id: 'list-3', title: 'Template List', isTemplate: true },
      ],
    };
    return selector(state);
  },
}));

vi.mock('@/services/lists.service', () => ({
  listsService: {
    addItem: (...args: unknown[]) => mockAddItem(...args),
  },
}));

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Organic Milk',
  brand: 'Horizon',
  categoryId: 'dairy',
  unit: '1 Gallon',
  averagePrice: 5.49,
  storePrices: [
    { storeId: 's1', storeName: 'Walmart', storeColor: '#3b82f6', price: 4.99, lastUpdated: '2026-01-01' },
    { storeId: 's2', storeName: 'Target', storeColor: '#ef4444', price: 5.29, lastUpdated: '2026-01-01' },
  ],
  priceHistory: [5.0, 5.2, 5.1, 4.99],
  volatility: 'low',
  createdAt: '2026-01-01',
};

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders product name and brand', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Organic Milk')).toBeInTheDocument();
    expect(screen.getByText(/Horizon/)).toBeInTheDocument();
  });

  it('renders average price', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('$5.49')).toBeInTheDocument();
  });

  it('renders store prices', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Walmart')).toBeInTheDocument();
    expect(screen.getByText('$4.99')).toBeInTheDocument();
    expect(screen.getByText('Target')).toBeInTheDocument();
    expect(screen.getByText('$5.29')).toBeInTheDocument();
  });

  it('renders placeholder image when no imageUrl', () => {
    render(<ProductCard product={mockProduct} />);
    const icon = document.querySelector('.material-symbols-outlined');
    expect(icon).toBeInTheDocument();
  });

  it('renders actual image when imageUrl exists', () => {
    const productWithImage = { ...mockProduct, imageUrl: 'https://storage.test/milk.jpg' };
    render(<ProductCard product={productWithImage} />);
    const img = screen.getByAltText('Organic Milk');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://storage.test/milk.jpg');
  });

  it('calls toggleCompare when compare button is clicked', () => {
    render(<ProductCard product={mockProduct} />);
    const compareBtn = screen.getAllByText('compare_arrows')[0].closest('button')!;
    fireEvent.click(compareBtn);
    expect(mockToggleCompare).toHaveBeenCalledWith('prod-1');
  });

  it('shows list picker when add-to-cart button is clicked', () => {
    render(<ProductCard product={mockProduct} />);
    const cartBtns = screen.getAllByText('add_shopping_cart');
    fireEvent.click(cartBtns[0].closest('button')!);
    expect(screen.getByText('Add to list:')).toBeInTheDocument();
  });

  it('shows only non-template lists in picker', () => {
    render(<ProductCard product={mockProduct} />);
    const cartBtns = screen.getAllByText('add_shopping_cart');
    fireEvent.click(cartBtns[0].closest('button')!);
    expect(screen.getByText('Weekly Groceries')).toBeInTheDocument();
    expect(screen.getByText('Party Shopping')).toBeInTheDocument();
    expect(screen.queryByText('Template List')).not.toBeInTheDocument();
  });

  it('calls listsService.addItem when a list is selected', async () => {
    render(<ProductCard product={mockProduct} />);
    const cartBtns = screen.getAllByText('add_shopping_cart');
    fireEvent.click(cartBtns[0].closest('button')!);
    fireEvent.click(screen.getByText('Weekly Groceries'));
    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith(
        expect.objectContaining({
          listId: 'list-1',
          name: 'Organic Milk',
          categoryId: 'dairy',
          quantity: 1,
          unit: '1 Gallon',
          estimatedPrice: 5.49,
          productId: 'prod-1',
        }),
      );
    });
  });

  it('shows check icon after successful add', async () => {
    render(<ProductCard product={mockProduct} />);
    const cartBtns = screen.getAllByText('add_shopping_cart');
    fireEvent.click(cartBtns[0].closest('button')!);
    fireEvent.click(screen.getByText('Weekly Groceries'));
    await waitFor(() => {
      expect(screen.getByText('check_circle')).toBeInTheDocument();
    });
  });

  it('closes list picker on outside click', () => {
    render(<ProductCard product={mockProduct} />);
    const cartBtns = screen.getAllByText('add_shopping_cart');
    fireEvent.click(cartBtns[0].closest('button')!);
    expect(screen.getByText('Add to list:')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Add to list:')).not.toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HistoryTable } from '@/features/history/HistoryTable';

// Mock the trips store
const mockTrips = Array.from({ length: 25 }, (_, i) => ({
  id: `trip-${i}`,
  date: `2026-01-${String(i + 1).padStart(2, '0')}`,
  storeName: i % 2 === 0 ? 'Walmart' : 'Target',
  storeColor: '#3b82f6',
  itemCount: 5 + i,
  totalSpent: 50 + i * 10,
  estimatedTotal: 55 + i * 10,
  savings: 5,
  savingsPercent: 9,
  items: [],
}));

vi.mock('@/store/trips-store', () => ({
  useTripsStore: (selector: (s: Record<string, unknown>) => unknown) => {
    const state = {
      getFilteredTrips: () => mockTrips,
      expandedTripId: null,
    };
    return selector(state);
  },
}));

// Mock the sub-components to simplify rendering
vi.mock('@/features/history/TripRow', () => ({
  TripRow: ({ trip }: { trip: { id: string; storeName: string } }) => (
    <tr data-testid={`trip-row-${trip.id}`}>
      <td>{trip.storeName}</td>
    </tr>
  ),
}));

vi.mock('@/features/history/TripExpandedDetail', () => ({
  TripExpandedDetail: () => null,
}));

describe('HistoryTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows correct pagination info on first page', () => {
    render(<HistoryTable />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('renders only 10 rows on first page', () => {
    render(<HistoryTable />);
    const rows = screen.getAllByTestId(/^trip-row-/);
    expect(rows).toHaveLength(10);
  });

  it('disables Previous button on first page', () => {
    render(<HistoryTable />);
    const prevBtn = screen.getByText('Previous');
    expect(prevBtn).toBeDisabled();
  });

  it('enables Next button when there are more pages', () => {
    render(<HistoryTable />);
    const nextBtn = screen.getByText('Next');
    expect(nextBtn).not.toBeDisabled();
  });

  it('navigates to second page when Next is clicked', () => {
    render(<HistoryTable />);
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('enables Previous after navigating to second page', () => {
    render(<HistoryTable />);
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Previous')).not.toBeDisabled();
  });

  it('navigates back to first page', () => {
    render(<HistoryTable />);
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Previous'));
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('disables Next on last page', () => {
    render(<HistoryTable />);
    // Navigate to last page (25 items / 10 per page = 3 pages)
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Next')).toBeDisabled();
  });

  it('shows remaining items on last page', () => {
    render(<HistoryTable />);
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    const rows = screen.getAllByTestId(/^trip-row-/);
    expect(rows).toHaveLength(5); // 25 - 20 = 5
  });
});

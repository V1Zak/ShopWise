import { create } from 'zustand';
import type { ShoppingTrip } from '@shopwise/shared';
import { mockShoppingTrips } from '@/data/mock-shopping-trips';

interface TripsState {
  trips: ShoppingTrip[];
  expandedTripId: string | null;
  searchQuery: string;
  toggleExpand: (tripId: string) => void;
  setSearch: (query: string) => void;
  getFilteredTrips: () => ShoppingTrip[];
}

export const useTripsStore = create<TripsState>((set, get) => ({
  trips: mockShoppingTrips,
  expandedTripId: 'trip1',
  searchQuery: '',

  toggleExpand: (tripId) =>
    set((state) => ({
      expandedTripId: state.expandedTripId === tripId ? null : tripId,
    })),

  setSearch: (query) => set({ searchQuery: query }),

  getFilteredTrips: () => {
    const { trips, searchQuery } = get();
    if (!searchQuery) return trips;
    const q = searchQuery.toLowerCase();
    return trips.filter(
      (t) =>
        t.storeName.toLowerCase().includes(q) ||
        t.date.toLowerCase().includes(q),
    );
  },
}));

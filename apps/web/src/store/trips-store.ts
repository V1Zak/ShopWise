import { create } from 'zustand';
import type { ShoppingTrip } from '@shopwise/shared';
import { tripsService } from '@/services/trips.service';

interface TripsState {
  trips: ShoppingTrip[];
  expandedTripId: string | null;
  searchQuery: string;
  isLoading: boolean;
  fetchTrips: () => Promise<void>;
  toggleExpand: (tripId: string) => void;
  setSearch: (query: string) => void;
  getFilteredTrips: () => ShoppingTrip[];
}

export const useTripsStore = create<TripsState>((set, get) => ({
  trips: [],
  expandedTripId: null,
  searchQuery: '',
  isLoading: false,

  fetchTrips: async () => {
    set({ isLoading: true });
    try {
      const trips = await tripsService.getTrips();
      set({ trips, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

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

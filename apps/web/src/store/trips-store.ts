import { create } from 'zustand';
import type { ShoppingTrip } from '@shopwise/shared';
import { tripsService } from '@/services/trips.service';

export type DateRange = 'all' | 'week' | 'month' | 'quarter' | 'year';

export interface SpentRange {
  min: number | null;
  max: number | null;
}

interface TripsState {
  trips: ShoppingTrip[];
  currentTrip: ShoppingTrip | null;
  expandedTripId: string | null;
  searchQuery: string;
  isLoading: boolean;
  dateRange: DateRange;
  storeFilter: string | null;
  spentRange: SpentRange;
  fetchTrips: () => Promise<void>;
  fetchTripById: (tripId: string) => Promise<void>;
  createTrip: (trip: {
    storeId: string;
    listId?: string;
    date?: string;
    itemCount: number;
    totalSpent: number;
    totalSaved: number;
    efficiencyScore?: number;
    metadata?: Record<string, unknown>;
  }) => Promise<string>;
  toggleExpand: (tripId: string) => void;
  setSearch: (query: string) => void;
  setDateRange: (range: DateRange) => void;
  setStoreFilter: (storeId: string | null) => void;
  setSpentRange: (min: number | null, max: number | null) => void;
  clearSpentRange: () => void;
  getFilteredTrips: () => ShoppingTrip[];
  getUniqueStores: () => { id: string; name: string }[];
}

// Memoization cache for getFilteredTrips
let _tripsFilteredCache: { key: string; result: ShoppingTrip[] } | null = null;

function parseTripDate(dateStr: string): Date {
  return new Date(dateStr);
}

function getDateCutoff(range: DateRange): Date | null {
  if (range === 'all') return null;
  const now = new Date();
  switch (range) {
    case 'week': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month': return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case 'quarter': return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case 'year': return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    default: return null;
  }
}

export const useTripsStore = create<TripsState>((set, get) => ({
  trips: [],
  currentTrip: null,
  expandedTripId: null,
  searchQuery: '',
  isLoading: false,
  dateRange: 'all',
  storeFilter: null,
  spentRange: { min: null, max: null },

  fetchTrips: async () => {
    set({ isLoading: true });
    try {
      const trips = await tripsService.getTrips();
      set({ trips, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchTripById: async (tripId: string) => {
    const existing = get().trips.find((t) => t.id === tripId);
    if (existing) {
      set({ currentTrip: existing });
      return;
    }
    set({ isLoading: true });
    try {
      const trip = await tripsService.getTripById(tripId);
      set({ currentTrip: trip, isLoading: false });
    } catch {
      set({ currentTrip: null, isLoading: false });
    }
  },

  createTrip: async (trip) => {
    const row = await tripsService.createTrip(trip);
    const newTrip: ShoppingTrip = {
      id: row.id,
      userId: row.user_id,
      listId: row.list_id ?? '',
      storeId: row.store_id,
      storeName: '',
      date: new Date(row.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      itemCount: row.item_count,
      totalSpent: Number(row.total_spent),
      totalSaved: Number(row.total_saved),
      efficiencyScore: row.efficiency_score ?? undefined,
      categoryBreakdown: [],
      insights: [],
    };
    set((state) => ({
      trips: [newTrip, ...state.trips],
      currentTrip: newTrip,
    }));
    return row.id;
  },

  toggleExpand: (tripId) =>
    set((state) => ({ expandedTripId: state.expandedTripId === tripId ? null : tripId })),

  setSearch: (query) => set({ searchQuery: query }),
  setDateRange: (range) => set({ dateRange: range }),
  setStoreFilter: (storeId) => set({ storeFilter: storeId }),
  setSpentRange: (min, max) => set({ spentRange: { min, max } }),
  clearSpentRange: () => set({ spentRange: { min: null, max: null } }),

  getFilteredTrips: () => {
    const { trips, searchQuery, dateRange, storeFilter, spentRange } = get();
    const cacheKey = `${trips.length}|${searchQuery}|${dateRange}|${storeFilter}|${spentRange.min}|${spentRange.max}`;
    if (_tripsFilteredCache && _tripsFilteredCache.key === cacheKey) return _tripsFilteredCache.result;
    const dateCutoff = getDateCutoff(dateRange);
    const filtered = trips.filter((t) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!t.storeName.toLowerCase().includes(q) && !t.date.toLowerCase().includes(q)) return false;
      }
      if (dateCutoff) {
        const tripDate = parseTripDate(t.date);
        if (tripDate < dateCutoff) return false;
      }
      if (storeFilter && t.storeId !== storeFilter) return false;
      if (spentRange.min !== null && t.totalSpent < spentRange.min) return false;
      if (spentRange.max !== null && t.totalSpent > spentRange.max) return false;
      return true;
    });
    _tripsFilteredCache = { key: cacheKey, result: filtered };
    return filtered;
  },

  getUniqueStores: () => {
    const { trips } = get();
    const seen = new Map<string, string>();
    for (const t of trips) {
      if (!seen.has(t.storeId)) seen.set(t.storeId, t.storeName);
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  },
}));

import { create } from 'zustand';
import { tripApi, TripItem, TripDetail } from '@/src/api/trip';

interface TripStore {
  trips: TripItem[];
  currentTrip: TripDetail | null;
  isLoading: boolean;

  fetchTrips: () => Promise<void>;
  fetchTripDetail: (id: number) => Promise<void>;
  createTrip: (title: string, startDate?: string, endDate?: string) => Promise<TripItem>;
  deleteTrip: (id: number) => Promise<void>;
  clearCurrentTrip: () => void;
}

export const useTripStore = create<TripStore>((set) => ({
  trips: [],
  currentTrip: null,
  isLoading: false,

  fetchTrips: async () => {
    set({ isLoading: true });
    try {
      const { data } = await tripApi.getMyTrips();
      set({ trips: data.data });
    } catch (error) {
      console.error('여행 목록 조회 실패:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTripDetail: async (id: number) => {
    set({ isLoading: true });
    try {
      const { data } = await tripApi.getTrip(id);
      set({ currentTrip: data.data });
    } catch (error) {
      console.error('여행 상세 조회 실패:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createTrip: async (title, startDate, endDate) => {
    const { data } = await tripApi.createTrip({ title, startDate, endDate });
    set((state) => ({ trips: [data.data, ...state.trips] }));
    return data.data;
  },

  deleteTrip: async (id: number) => {
    await tripApi.deleteTrip(id);
    set((state) => ({ trips: state.trips.filter((t) => t.id !== id) }));
  },

  clearCurrentTrip: () => set({ currentTrip: null }),
}));

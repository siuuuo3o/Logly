import { create } from 'zustand';
import { recordApi, RecordItem } from '@/src/api/record';

interface Draft {
  placeId: number | null;
  placeName: string;
  placeAddress: string;
  latitude: number | null;
  longitude: number | null;
  categoryId: number | null;
  type: 'DAILY' | 'TRAVEL';
  recordedAt: string;
  weather: string | null;
  temperature: number | null;
  images: string[]; // local URIs
}

interface RecordStore {
  timeline: RecordItem[];
  hasNext: boolean;
  page: number;
  isLoading: boolean;

  draft: Draft;

  fetchTimeline: (reset?: boolean) => Promise<void>;
  setDraft: (data: Partial<Draft>) => void;
  resetDraft: () => void;
}

const today = new Date().toISOString().split('T')[0];

const initialDraft: Draft = {
  placeId: null,
  placeName: '',
  placeAddress: '',
  latitude: null,
  longitude: null,
  categoryId: null,
  type: 'DAILY',
  recordedAt: today,
  weather: null,
  temperature: null,
  images: [],
};

export const useRecordStore = create<RecordStore>((set, get) => ({
  timeline: [],
  hasNext: true,
  page: 0,
  isLoading: false,

  draft: { ...initialDraft },

  fetchTimeline: async (reset = false) => {
    const { isLoading, hasNext, page } = get();

    if (isLoading) return;
    if (!reset && !hasNext) return;

    const nextPage = reset ? 0 : page;

    set({ isLoading: true });

    try {
      const { data } = await recordApi.getTimeline(nextPage, 10);
      const result = data.data;

      set((state) => ({
        timeline: reset ? result.records : [...state.timeline, ...result.records],
        hasNext: result.hasNext,
        page: nextPage + 1,
      }));
    } catch (error) {
      console.error('타임라인 조회 실패:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setDraft: (data) =>
    set((state) => ({
      draft: { ...state.draft, ...data },
    })),

  resetDraft: () =>
    set({
      draft: {
        ...initialDraft,
        recordedAt: new Date().toISOString().split('T')[0],
      },
    }),
}));

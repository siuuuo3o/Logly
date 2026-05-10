import { create } from 'zustand';
import { shareApi, ShareGroupItem } from '@/src/api/share';
import { RecordItem } from '@/src/api/record';

interface ShareStore {
  group: ShareGroupItem | null;
  sharedTimeline: RecordItem[];
  hasNext: boolean;
  page: number;
  isLoading: boolean;

  fetchMyGroup: () => Promise<void>;
  createGroup: () => Promise<ShareGroupItem>;
  joinGroup: (inviteCode: string) => Promise<ShareGroupItem>;
  leaveGroup: () => Promise<void>;
  removeMember: (groupId: number, targetUserId: number) => Promise<void>;
  fetchSharedTimeline: (reset?: boolean) => Promise<void>;
}

export const useShareStore = create<ShareStore>((set, get) => ({
  group: null,
  sharedTimeline: [],
  hasNext: false,
  page: 0,
  isLoading: false,

  fetchMyGroup: async () => {
    set({ isLoading: true });
    try {
      const { data } = await shareApi.getMyGroup();
      set({ group: data.data });
    } catch {
      set({ group: null });
    } finally {
      set({ isLoading: false });
    }
  },

  createGroup: async () => {
    const { data } = await shareApi.createGroup();
    set({ group: data.data });
    return data.data;
  },

  joinGroup: async (inviteCode: string) => {
    const { data } = await shareApi.joinGroup(inviteCode);
    set({ group: data.data });
    return data.data;
  },

  leaveGroup: async () => {
    await shareApi.leaveGroup();
    set({ group: null, sharedTimeline: [], page: 0, hasNext: false });
  },

  removeMember: async (groupId: number, targetUserId: number) => {
    await shareApi.removeMember(groupId, targetUserId);
    const { data } = await shareApi.getMyGroup();
    set({ group: data.data });
  },

  fetchSharedTimeline: async (reset = false) => {
    const { page, sharedTimeline, isLoading } = get();
    if (isLoading) return;

    const nextPage = reset ? 0 : page;
    set({ isLoading: true });
    try {
      const { data } = await shareApi.getSharedTimeline(nextPage, 10);
      const incoming = data.data.records;
      set({
        sharedTimeline: reset ? incoming : [...sharedTimeline, ...incoming],
        hasNext: data.data.hasNext,
        page: nextPage + 1,
      });
    } catch (error) {
      console.error('공유 타임라인 조회 실패:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

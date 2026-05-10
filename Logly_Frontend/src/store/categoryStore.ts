import { create } from 'zustand';
import { categoryApi, CategoryItem, CategoryRequest } from '@/src/api/category';

interface CategoryStore {
  categories: CategoryItem[];
  isLoading: boolean;
  isLoaded: boolean;

  fetchCategories: (force?: boolean) => Promise<void>;
  createCategory: (data: CategoryRequest) => Promise<CategoryItem>;
  updateCategory: (id: number, data: CategoryRequest) => Promise<CategoryItem>;
  deleteCategory: (id: number) => Promise<void>;
  reset: () => void;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  isLoading: false,
  isLoaded: false,

  fetchCategories: async (force = false) => {
    if (!force && (get().isLoading || get().isLoaded)) return;
    set({ isLoading: true });
    try {
      const { data } = await categoryApi.list();
      set({ categories: data.data ?? [], isLoaded: true });
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createCategory: async (data) => {
    const res = await categoryApi.create(data);
    const created = res.data.data;
    set((state) => ({ categories: [...state.categories, created] }));
    return created;
  },

  updateCategory: async (id, data) => {
    const res = await categoryApi.update(id, data);
    const updated = res.data.data;
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? updated : c)),
    }));
    return updated;
  },

  deleteCategory: async (id) => {
    await categoryApi.remove(id);
    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
  },

  reset: () => set({ categories: [], isLoaded: false }),
}));

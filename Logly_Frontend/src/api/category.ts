import { apiClient } from './client';

export interface CategoryItem {
  id: number;
  name: string;
  color: string;
  icon: string | null;
  isDefault: boolean;
}

export interface CategoryRequest {
  name: string;
  color: string;
  icon?: string;
}

export const categoryApi = {
  list: () =>
    apiClient.get<{ data: CategoryItem[] }>('/api/category/'),

  create: (data: CategoryRequest) =>
    apiClient.post<{ data: CategoryItem }>('/api/category/', data),

  update: (id: number, data: CategoryRequest) =>
    apiClient.patch<{ data: CategoryItem }>(`/api/category/${id}`, data),

  remove: (id: number) =>
    apiClient.delete(`/api/category/${id}`),
};

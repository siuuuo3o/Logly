import { apiClient as client } from './client';

export interface NoticeItem {
  id: number;
  title: string;
  content: string;
  important: boolean;
  createdAt: string;
}

export const noticeApi = {
  getAll: () => client.get<{ success: boolean; data: NoticeItem[] }>('/api/notice/'),
};

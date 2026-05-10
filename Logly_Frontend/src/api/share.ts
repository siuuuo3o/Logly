import { apiClient } from './client';
import { TimelinePageResponse } from './record';

export interface MemberItem {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  role: 'OWNER' | 'MEMBER';
  joinedAt: string;
}

export interface ShareGroupItem {
  id: number;
  inviteCode: string;
  createdAt: string;
  members: MemberItem[];
}

export const shareApi = {
  createGroup: () =>
    apiClient.post<{ data: ShareGroupItem }>('/api/share/'),

  joinGroup: (inviteCode: string) =>
    apiClient.post<{ data: ShareGroupItem }>('/api/share/join', { inviteCode }),

  getMyGroup: () =>
    apiClient.get<{ data: ShareGroupItem }>('/api/share/'),

  leaveGroup: () =>
    apiClient.delete('/api/share/leave'),

  removeMember: (groupId: number, targetUserId: number) =>
    apiClient.delete(`/api/share/${groupId}/members/${targetUserId}`),

  getSharedTimeline: (page = 0, size = 10) =>
    apiClient.get<{ data: TimelinePageResponse }>('/api/share/timeline', {
      params: { page, size },
    }),
};

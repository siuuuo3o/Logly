import { apiClient } from './client';

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  nickname: string;
}

export interface ProfileResponse {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
}

export interface StatsResponse {
  recordCount: number;
  tripCount: number;
  diaryCount: number;
}

export const authApi = {
  signup: (body: SignupRequest) =>
    apiClient.post<{ data: AuthResponse }>('/api/auth/signup', body),

  login: (body: LoginRequest) =>
    apiClient.post<{ data: AuthResponse }>('/api/auth/login', body),

  reissue: (refreshToken: string) =>
    apiClient.post<{ data: { accessToken: string } }>('/api/auth/reissue', {
      refreshToken,
    }),

  getProfile: () =>
    apiClient.get<{ data: ProfileResponse }>('/api/auth/profile'),

  updateProfile: (nickname?: string, profileImage?: { uri: string; name: string; type: string }) => {
    const formData = new FormData();
    if (nickname) formData.append('nickname', nickname);
    if (profileImage) formData.append('profileImage', profileImage as any);
    return apiClient.patch<{ data: ProfileResponse }>('/api/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getStats: () =>
    apiClient.get<{ data: StatsResponse }>('/api/auth/stats'),

  registerPushToken: (token: string) =>
    apiClient.post('/api/auth/push-token', { token }),
};

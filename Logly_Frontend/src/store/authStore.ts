import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authApi, LoginRequest, SignupRequest, StatsResponse } from '@/src/api/auth';

interface AuthState {
  userId: number | null;
  nickname: string | null;
  email: string | null;
  profileImageUrl: string | null;
  stats: StatsResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (body: LoginRequest) => Promise<void>;
  signup: (body: SignupRequest) => Promise<void>;
  setSession: (accessToken: string, refreshToken: string, userId: number, nickname: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (nickname?: string, profileImage?: { uri: string; name: string; type: string }) => Promise<void>;
  fetchStats: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  nickname: null,
  email: null,
  profileImageUrl: null,
  stats: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (body) => {
    const { data } = await authApi.login(body);
    const { accessToken, refreshToken, userId, nickname } = data.data;

    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);

    set({ userId, nickname, isAuthenticated: true });
  },

  signup: async (body) => {
    const { data } = await authApi.signup(body);
    const { accessToken, refreshToken, userId, nickname } = data.data;

    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);

    set({ userId, nickname, isAuthenticated: true });
  },

  setSession: async (accessToken, refreshToken, userId, nickname) => {
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    set({ userId, nickname, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ userId: null, nickname: null, email: null, profileImageUrl: null, stats: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        set({ isAuthenticated: true });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProfile: async () => {
    const { data } = await authApi.getProfile();
    const { id, email, nickname, profileImageUrl } = data.data;
    set({ userId: id, email, nickname, profileImageUrl });
  },

  updateProfile: async (nickname, profileImage) => {
    const { data } = await authApi.updateProfile(nickname, profileImage);
    set({ nickname: data.data.nickname, profileImageUrl: data.data.profileImageUrl });
  },

  fetchStats: async () => {
    const { data } = await authApi.getStats();
    set({ stats: data.data });
  },
}));

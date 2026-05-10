// expo install expo-image-picker expo-location
import { apiClient } from './client';
import { CategoryItem } from './category';

export interface PlaceInfo {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface RecordImage {
  id: number;
  imageUrl: string;
  isRepresentative: boolean;
  orderIndex: number;
}

export interface RecordItem {
  id: number;
  userId: number;
  type: 'DAILY' | 'TRAVEL';
  content: string | null;
  diaryTitle: string | null;
  weather: string | null;
  temperature: number | null;
  visibility: 'PRIVATE' | 'SHARED';
  recordedAt: string;
  place: PlaceInfo;
  category: CategoryItem | null;
  images: RecordImage[];
  tripId: number | null;
  createdAt: string;
}

export interface TimelinePageResponse {
  records: RecordItem[];
  hasNext: boolean;
  total: number;
}

export interface CreateRecordRequest {
  placeId: number;
  categoryId?: number;
  type: 'DAILY' | 'TRAVEL';
  content?: string;
  diaryTitle?: string;
  weather?: string;
  temperature?: number;
  visibility: 'PRIVATE' | 'SHARED';
  recordedAt: string; // YYYY-MM-DD
  tripId?: number;
}

export interface WeatherResponse {
  weather: string;
  temperature: number;
}

export const recordApi = {
  getTimeline: (page: number, size: number) =>
    apiClient.get<{ data: TimelinePageResponse }>('/api/record/', {
      params: { page, size },
    }),

  getRecord: (id: number) =>
    apiClient.get<{ data: RecordItem }>(`/api/record/${id}`),

  createRecord: (data: CreateRecordRequest) =>
    apiClient.post<{ data: RecordItem }>('/api/record/', data),

  updateRecord: (id: number, data: Partial<CreateRecordRequest>) =>
    apiClient.patch<{ data: RecordItem }>(`/api/record/${id}`, data),

  deleteRecord: (id: number) =>
    apiClient.delete(`/api/record/${id}`),

  uploadImages: (recordId: number, formData: FormData) =>
    apiClient.post(`/api/record/${recordId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getWeather: (lat: number, lon: number) =>
    apiClient.get<{ data: WeatherResponse }>('/api/record/weather', {
      params: { lat, lon },
    }),
};

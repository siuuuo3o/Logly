import { apiClient } from './client';
import { RecordItem } from './record';

export interface TripItem {
  id: number;
  userId: number;
  title: string;
  coverImageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  recordCount: number;
  diaryCount: number;
  createdAt: string;
}

export interface TripDetail extends TripItem {
  records: RecordItem[];
}

export interface CreateTripRequest {
  title: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateTripRequest {
  title?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export const tripApi = {
  getMyTrips: () =>
    apiClient.get<{ data: TripItem[] }>('/api/trip/'),

  getTrip: (id: number) =>
    apiClient.get<{ data: TripDetail }>(`/api/trip/${id}`),

  createTrip: (data: CreateTripRequest) =>
    apiClient.post<{ data: TripItem }>('/api/trip/', data),

  updateTrip: (id: number, data: UpdateTripRequest) =>
    apiClient.patch<{ data: TripItem }>(`/api/trip/${id}`, data),

  deleteTrip: (id: number) =>
    apiClient.delete(`/api/trip/${id}`),

  uploadCoverImage: (id: number, formData: FormData) =>
    apiClient.post<{ data: TripItem }>(`/api/trip/${id}/cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

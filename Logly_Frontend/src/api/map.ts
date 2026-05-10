import { apiClient } from './client';

export interface MapRecord {
  id: number;
  type: 'DAILY' | 'TRAVEL';
  placeName: string;
  latitude: number;
  longitude: number;
  representativeImageUrl: string | null;
  recordedAt: string;
  tripId: number | null;
  categoryId: number | null;
  categoryName: string | null;
  categoryColor: string | null;
  categoryIcon: string | null;
}

export interface ClusterPin {
  latitude: number;
  longitude: number;
  count: number;
  type: 'DAILY' | 'TRAVEL' | 'MIXED';
  recordIds: number[];
  placeName: string | null;
  categoryColor: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
}

export const mapApi = {
  getPins: (zoom: number) =>
    apiClient.get<{ data: ClusterPin[] }>('/api/map/pins', { params: { zoom } }),

  getTripCourse: (tripId: number) =>
    apiClient.get<{ data: MapRecord[] }>(`/api/map/trip/${tripId}/course`),
};

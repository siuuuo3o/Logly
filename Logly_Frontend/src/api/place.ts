import { apiClient } from './client';
import { PlaceInfo } from './record';

export interface CreatePlaceRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export const placeApi = {
  createPlace: (data: CreatePlaceRequest) =>
    apiClient.post<{ data: PlaceInfo }>('/api/place/', data),

  getPlace: (id: number) =>
    apiClient.get<{ data: PlaceInfo }>(`/api/place/${id}`),
};

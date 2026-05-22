import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client.js';
import type { Tour } from '@dark-angels/types';

interface ToursParams {
  page?: number;
  limit?: number;
  tags?: string;
  search?: string;
  is_vip?: boolean;
}

interface PaginatedResponse {
  success: true;
  data: Tour[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

interface ListResponse {
  success: true;
  data: Tour[];
}

interface SingleResponse {
  success: true;
  data: Tour;
}

export type TourInput = Omit<Tour, 'id' | 'created_at' | 'updated_at'>;

export function useTours(params?: ToursParams) {
  return useQuery({
    queryKey: ['tours', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse>('/tours', { params });
      return data;
    },
  });
}

export function useFeaturedTours() {
  return useQuery({
    queryKey: ['tours', 'featured'],
    queryFn: async () => {
      const { data } = await apiClient.get<ListResponse>('/tours/featured');
      return data;
    },
  });
}

export function useTour(id: string) {
  return useQuery({
    queryKey: ['tour', id],
    queryFn: async () => {
      const { data } = await apiClient.get<SingleResponse>(`/tours/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TourInput) => {
      const { data } = await apiClient.post<SingleResponse>('/tours', input);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tours'] });
    },
  });
}

export function useUpdateTour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & Partial<TourInput>) => {
      const { data } = await apiClient.put<SingleResponse>(`/tours/${id}`, patch);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tours'] });
    },
  });
}

export function useDeleteTour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/tours/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tours'] });
    },
  });
}

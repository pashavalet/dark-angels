import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client.js';
import type { Service } from '@dark-angels/types';

interface ServicesParams {
  page?: number;
  limit?: number;
  tags?: string;
  search?: string;
}

interface PaginatedResponse {
  success: true;
  data: Service[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

interface ListResponse {
  success: true;
  data: Service[];
}

interface SingleResponse {
  success: true;
  data: Service;
}

export type ServiceInput = Omit<Service, 'id' | 'created_at' | 'updated_at'>;

export function useServices(params?: ServicesParams) {
  return useQuery({
    queryKey: ['services', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse>('/services', { params });
      return data;
    },
  });
}

export function useFeaturedServices() {
  return useQuery({
    queryKey: ['services', 'featured'],
    queryFn: async () => {
      const { data } = await apiClient.get<ListResponse>('/services/featured');
      return data;
    },
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const { data } = await apiClient.get<SingleResponse>(`/services/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ServiceInput) => {
      const { data } = await apiClient.post<SingleResponse>('/services', input);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & Partial<ServiceInput>) => {
      const { data } = await apiClient.put<SingleResponse>(`/services/${id}`, patch);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/services/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

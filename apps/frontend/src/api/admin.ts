import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client.js';

interface StatsData {
  counts: { tours: number; services: number; blog: number };
  recent: {
    tours: { id: string; title: Record<string, string>; created_at: string }[];
    services: { id: string; title: Record<string, string>; created_at: string }[];
    blog: { id: string; title: Record<string, string>; created_at: string }[];
  };
}

interface StatsResponse {
  success: true;
  data: StatsData;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get<StatsResponse>('/admin/stats');
      return data.data;
    },
  });
}
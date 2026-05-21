import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client.js';
import type { Tour, Service, BlogArticle, HomepageCollection } from '@dark-angels/types';

export type FeaturedTour = Tour & HomepageCollection & { collection_id: string };
export type FeaturedService = Service & HomepageCollection & { collection_id: string };
export type FeaturedBlog = BlogArticle & HomepageCollection & { collection_id: string };

export interface HomepageData {
  featured_tours: FeaturedTour[];
  featured_services: FeaturedService[];
  featured_blog: FeaturedBlog[];
}

export function useHomepageCollections() {
  return useQuery<HomepageData>({
    queryKey: ['homepage'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: HomepageData }>('/homepage');
      return data.data;
    },
  });
}

export function useSetCollections() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { section: string; items: unknown[] }) => {
      const { data } = await apiClient.put('/homepage', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['homepage'] }),
  });
}

export function useReorderCollections() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { section: string; orders: { id: string; sort_order: number }[] }) => {
      const { data } = await apiClient.patch('/homepage/reorder', payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['homepage'] }),
  });
}

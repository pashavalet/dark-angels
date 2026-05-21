import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client.js';
import type { BlogArticle } from '@dark-angels/types';

interface BlogsParams {
  page?: number;
  limit?: number;
  tags?: string;
  search?: string;
  access_level?: string;
}

interface PaginatedResponse {
  success: true;
  data: BlogArticle[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

interface ListResponse {
  success: true;
  data: BlogArticle[];
}

interface SingleResponse {
  success: true;
  data: BlogArticle;
}

export type BlogInput = Omit<BlogArticle, 'id' | 'created_at' | 'updated_at'>;

export function useBlogs(params?: BlogsParams) {
  return useQuery({
    queryKey: ['blogs', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse>('/blog', { params });
      return data;
    },
  });
}

export function useFeaturedBlogs() {
  return useQuery({
    queryKey: ['blogs', 'featured'],
    queryFn: async () => {
      const { data } = await apiClient.get<ListResponse>('/blog/featured');
      return data;
    },
  });
}

export function useBlog(id: string) {
  return useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      const { data } = await apiClient.get<SingleResponse>(`/blog/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: BlogInput) => {
      const { data } = await apiClient.post<SingleResponse>('/blog', input);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}

export function useUpdateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & Partial<BlogInput>) => {
      const { data } = await apiClient.put<SingleResponse>(`/blog/${id}`, patch);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}

export function useDeleteBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/blog/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}

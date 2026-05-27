import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from './client.js';

interface StatsData {
  counts: { tours: number; services: number; blog: number; telegram_users: number };
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

interface TelegramUser {
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  language_code: string | null;
  is_premium: boolean;
  access_level: string;
  is_channel_subscriber: boolean;
  first_seen_at: string;
  last_seen_at: string;
}

interface TelegramUsersParams {
  page?: number;
  limit?: number;
  subscribed?: boolean;
  premium?: boolean;
  language?: string;
  search?: string;
}

interface TelegramUsersResponse {
  success: true;
  data: TelegramUser[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

interface TelegramUserResponse {
  success: true;
  data: {
    user: TelegramUser;
    activity: {
      id: string;
      telegram_id: number;
      page: string | null;
      item_type: string | null;
      item_id: string | null;
      created_at: string;
    }[];
    stats: {
      total_interactions: number;
      unique_pages: number;
      page_breakdown: Record<string, number>;
    };
  };
}

export function useTelegramUsers(params?: TelegramUsersParams) {
  return useQuery({
    queryKey: ['admin', 'telegram-users', params],
    queryFn: async () => {
      const { data } = await apiClient.get<TelegramUsersResponse>('/admin/telegram-users', { params });
      return data;
    },
  });
}

export function useTelegramUser(telegramId: string) {
  return useQuery({
    queryKey: ['admin', 'telegram-user', telegramId],
    queryFn: async () => {
      const { data } = await apiClient.get<TelegramUserResponse>(`/admin/telegram-users/${telegramId}`);
      return data.data;
    },
    enabled: !!telegramId,
  });
}

export function useDownloadTelegramUsers() {
  return useMutation({
    mutationFn: async (params?: TelegramUsersParams) => {
      const { data } = await apiClient.get('/admin/telegram-users/download', {
        params,
        responseType: 'blob',
      });
      const url = URL.createObjectURL(data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'telegram-users.csv';
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}

export function useGenerateTelegramLinkCode() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/admin/telegram-link-code');
      return data.data as { code: string; expires_in_minutes: number };
    },
  });
}

export function useTelegramLinkStatus() {
  return useQuery({
    queryKey: ['admin', 'telegram-link-status'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/telegram-link-status');
      return data.data as { linked: boolean; telegram_id: number | null };
    },
  });
}
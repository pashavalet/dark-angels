import { useMutation } from '@tanstack/react-query';
import { apiClient } from './client.js';

interface TelegramAuthResponse {
  success: true;
  data: {
    access_token: string;
    user: {
      telegram_id: number;
      username: string | null;
      first_name: string;
      is_subscribed: boolean;
      is_admin: boolean;
      access_level: string;
    };
  };
}

export function useTelegramAuth() {
  return useMutation({
    mutationFn: async (initData: string) => {
      const { data } = await apiClient.post<TelegramAuthResponse>('/auth/telegram', { initData });
      return data.data;
    },
  });
}

export function useTelegramRefresh() {
  return useMutation({
    mutationFn: async (initData: string) => {
      const { data } = await apiClient.post<{ success: true; data: { access_token: string; is_subscribed: boolean; access_level: string } }>(
        '/auth/telegram/refresh',
        { initData },
      );
      return data.data;
    },
  });
}

export function useTrackPage() {
  return useMutation({
    mutationFn: async (payload: { initData: string; page: string; item_type?: string; item_id?: string }) => {
      await apiClient.post('/track', payload);
    },
  });
}
import { apiClient } from './client.js';

export async function login(email: string, password: string) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data;
}

export async function refreshToken() {
  const { data } = await apiClient.post('/auth/refresh');
  return data;
}

export async function logout() {
  const { data } = await apiClient.post('/auth/logout');
  return data;
}
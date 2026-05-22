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

export async function setup2FA() {
  const { data } = await apiClient.post('/auth/2fa/setup');
  return data.data;
}

export async function verify2FA(code: string) {
  const { data } = await apiClient.post('/auth/2fa/verify', { code });
  return data.data;
}

export async function disable2FA(code: string) {
  const { data } = await apiClient.post('/auth/2fa/disable', { code });
  return data;
}

export async function challenge2FA(tempToken: string, code: string) {
  const { data } = await apiClient.post('/auth/2fa/challenge', { temp_token: tempToken, code });
  return data.data;
}

export async function recover2FA(email: string, code: string) {
  const { data } = await apiClient.post('/auth/recovery', { email, recovery_code: code });
  return data.data;
}
import { apiClient } from './client.js';

export async function uploadImage(file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
  return data.data;
}

export async function deleteImage(filename: string): Promise<void> {
  await apiClient.delete(`/upload/${filename}`);
}

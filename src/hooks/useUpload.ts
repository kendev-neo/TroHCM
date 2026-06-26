import { useMutation } from '@tanstack/react-query';
import apiClient from '../lib/axios';

// ── Types ──────────────────────────────────────────────────────────────────

export interface UploadResult {
  url: string;
}

export interface UploadMultipleResult {
  urls: string[];
}

// ── Hooks ──────────────────────────────────────────────────────────────────

/** Upload 1 ảnh lên Supabase Storage qua backend */
export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('file', file);

      // Phải set Content-Type thành undefined để axios tự set boundary cho multipart
      const { data } = await apiClient.post<UploadResult>('/upload/image', formData, {
        headers: { 'Content-Type': undefined },
      });
      return data.url;
    },
  });
}

/** Upload nhiều ảnh cùng lúc */
export function useUploadImages() {
  return useMutation({
    mutationFn: async (files: File[]): Promise<string[]> => {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));

      const { data } = await apiClient.post<UploadMultipleResult>('/upload/images', formData, {
        headers: { 'Content-Type': undefined },
      });
      return data.urls;
    },
  });
}

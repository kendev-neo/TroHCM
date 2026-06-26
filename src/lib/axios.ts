import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor — tự gắn Bearer token từ Zustand store
apiClient.interceptors.request.use(
  (config) => {
    // Lấy token trực tiếp từ Zustand store state (không qua hook — dùng getState())
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — xử lý lỗi 401 (token hết hạn)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token không hợp lệ hoặc hết hạn → clear auth state
      useAuthStore.getState().reset();
    }
    return Promise.reject(error);
  },
);

// Helper: lấy error message từ Axios error
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data?.message === 'string') return data.message;
    if (Array.isArray(data?.message)) return data.message.join(', ');
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Đã xảy ra lỗi không xác định';
}

export default apiClient;

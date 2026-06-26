import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/axios';
import { useAuthStore, AdminProfile } from '../stores/authStore';

// ── Query Keys ─────────────────────────────────────────────────────────────

export const profileKeys = {
  me: ['profile', 'me'] as const,
};

// ── Hooks ──────────────────────────────────────────────────────────────────

/** Lấy profile của user đang đăng nhập */
export function useProfile() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: async () => {
      const { data } = await apiClient.get<AdminProfile>('/users/me');
      return data;
    },
    // Chỉ fetch khi có token
    enabled: !!token,
  });
}

/** Cập nhật profile */
export function useUpdateProfile() {
  const qc = useQueryClient();
  const setProfile = useAuthStore((s) => s.setProfile);

  return useMutation({
    mutationFn: async (dto: {
      fullName?: string;
      phoneNumber?: string;
      avatarUrl?: string;
      role?: string;
    }) => {
      const { data } = await apiClient.put<AdminProfile>('/users/me', dto);
      return data;
    },
    onSuccess: (data) => {
      // Cập nhật cả cache lẫn Zustand store
      qc.setQueryData(profileKeys.me, data);
      setProfile(data);
    },
  });
}

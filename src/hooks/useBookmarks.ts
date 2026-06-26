import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/axios';
import { useAuthStore } from '../stores/authStore';
import { Room } from './useRooms';

// ── Types ──────────────────────────────────────────────────────────────────

export interface Bookmark {
  id: string;
  room_id: string;
  student_id: string;
  created_at: string;
  room: Room;
}

// ── Query Keys ─────────────────────────────────────────────────────────────

export const bookmarkKeys = {
  all: ['bookmarks'] as const,
  list: () => [...bookmarkKeys.all, 'list'] as const,
};

// ── Hooks ──────────────────────────────────────────────────────────────────

/** Lấy danh sách bookmark của user hiện tại */
export function useBookmarks() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: bookmarkKeys.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<Bookmark[]>('/bookmarks');
      return data;
    },
    enabled: !!token,
  });
}

/** Kiểm tra 1 phòng đã được bookmark chưa */
export function useIsBookmarked(roomId: string) {
  const { data: bookmarks } = useBookmarks();
  return bookmarks?.some((b) => b.room_id === roomId) ?? false;
}

/** Toggle bookmark (thêm nếu chưa có, xóa nếu đã có) */
export function useToggleBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ roomId, isBookmarked }: { roomId: string; isBookmarked: boolean }) => {
      if (isBookmarked) {
        await apiClient.delete(`/bookmarks/${roomId}`);
        return { roomId, action: 'removed' as const };
      } else {
        const { data } = await apiClient.post<Bookmark>(`/bookmarks/${roomId}`);
        return { roomId, action: 'added' as const, bookmark: data };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookmarkKeys.list() });
    },
  });
}

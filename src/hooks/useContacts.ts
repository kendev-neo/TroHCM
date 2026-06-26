import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/axios';

// ── Types ──────────────────────────────────────────────────────────────────

export interface Contact {
  id: string;
  landlord_name: string;
  landlord_phone: string;
  landlord_email: string;
  room_title: string;
  room_description: string;
  room_price: number;
  room_area: number;
  room_type: string;
  room_address: string;
  room_ward: string;
  room_district: string;
  room_utilities: string[];
  room_images: string[];
  status: 'pending' | 'approved' | 'ignored';
  created_at: string;
}

export interface CreateContactDto {
  landlordName: string;
  landlordPhone: string;
  landlordEmail: string;
  roomTitle: string;
  roomDescription?: string;
  roomPrice: number;
  roomArea: number;
  roomType: string;
  roomAddress: string;
  roomWard: string;
  roomDistrict: string;
  roomUtilities?: string[];
  roomImages?: string[];
}

// ── Query Keys ─────────────────────────────────────────────────────────────

export const contactKeys = {
  all: ['contacts'] as const,
  list: () => [...contactKeys.all, 'list'] as const,
};

// ── Hooks ──────────────────────────────────────────────────────────────────

/** Lấy danh sách liên hệ (admin only) */
export function useContacts() {
  return useQuery({
    queryKey: contactKeys.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<Contact[]>('/contacts');
      return data;
    },
  });
}

/** Gửi yêu cầu đăng tin (public — không cần auth) */
export function useCreateContact() {
  return useMutation({
    mutationFn: async (dto: CreateContactDto) => {
      const { data } = await apiClient.post<Contact>('/contacts', dto);
      return data;
    },
  });
}

/** Cập nhật trạng thái liên hệ (admin: approved / ignored) */
export function useUpdateContactStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'ignored' }) => {
      const { data } = await apiClient.put<Contact>(`/contacts/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contactKeys.list() });
    },
  });
}

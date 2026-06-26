import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/axios";

// ── Types ──────────────────────────────────────────────────────────────────

export interface RoomImage {
    url: string;
    is_primary: boolean;
}

export interface Room {
    id: string;
    title: string;
    description: string;
    price: number;
    area: number;
    room_type: string;
    address: string;
    ward: string;
    district: string;
    status: string;
    utilities: string[];
    created_at: string;
    landlord_id: string;
    landlord?: {
        full_name: string;
        phone_number?: string;
        avatar_url?: string;
        email: string;
    };
    images: RoomImage[];
    university?: { id: string; name: string; abbreviation: string };
}

export interface RoomsFilter {
    search?: string;
    district?: string;
    minPrice?: number;
    maxPrice?: number;
    roomType?: string;
    universityId?: string;
    page?: number;
    limit?: number;
}

export interface CreateRoomDto {
    title: string;
    description?: string;
    price: number;
    area: number;
    roomType: string;
    address: string;
    ward: string;
    district: string;
    utilities?: string[];
    images?: string[];
    landlordName?: string;
    landlordPhone?: string;
    landlordEmail?: string;
}

// ── Query Keys ─────────────────────────────────────────────────────────────

export const roomKeys = {
    all: ["rooms"] as const,
    lists: () => [...roomKeys.all, "list"] as const,
    list: (filters: RoomsFilter) => [...roomKeys.lists(), filters] as const,
    details: () => [...roomKeys.all, "detail"] as const,
    detail: (id: string) => [...roomKeys.details(), id] as const,
};

// ── Hooks ──────────────────────────────────────────────────────────────────

/** Lấy danh sách phòng trọ có filter và cache */
export function useRooms(filters: RoomsFilter = {}) {
    return useQuery({
        queryKey: roomKeys.list(filters),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.search) params.set("search", filters.search);
            if (filters.district) params.set("district", filters.district);
            if (filters.minPrice)
                params.set("minPrice", String(filters.minPrice));
            if (filters.maxPrice)
                params.set("maxPrice", String(filters.maxPrice));
            if (filters.roomType) params.set("roomType", filters.roomType);
            if (filters.universityId)
                params.set("universityId", filters.universityId);
            if (filters.page) params.set("page", String(filters.page));
            if (filters.limit) params.set("limit", String(filters.limit));

            const { data } = await apiClient.get<{
                data: Room[];
                total: number;
            }>(`/rooms?${params.toString()}`);
            return data;
        },
        placeholderData: (prev) => prev,
    });
}

/** Paginated rooms hook với page/limit mặc định */
export function usePaginatedRooms(filters: RoomsFilter = {}) {
    return useRooms(filters);
}

/** Lấy chi tiết 1 phòng trọ */
export function useRoom(id: string) {
    return useQuery({
        queryKey: roomKeys.detail(id),
        queryFn: async () => {
            const { data } = await apiClient.get<Room>(`/rooms/${id}`);
            return data;
        },
        enabled: !!id,
    });
}

/** Tạo phòng trọ mới */
export function useCreateRoom() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (dto: CreateRoomDto) => {
            const { data } = await apiClient.post<Room>("/rooms", dto);
            return data;
        },
        onSuccess: () => {
            // Invalidate tất cả room lists để refetch
            qc.invalidateQueries({ queryKey: roomKeys.lists() });
        },
    });
}

/** Cập nhật phòng trọ */
export function useUpdateRoom() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            dto,
        }: {
            id: string;
            dto: Partial<CreateRoomDto>;
        }) => {
            const { data } = await apiClient.put<Room>(`/rooms/${id}`, dto);
            return data;
        },
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: roomKeys.lists() });
            qc.setQueryData(roomKeys.detail(data.id), data);
        },
    });
}

/** Xóa phòng trọ */
export function useDeleteRoom() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/rooms/${id}`);
            return id;
        },
        onSuccess: (id) => {
            qc.invalidateQueries({ queryKey: roomKeys.lists() });
            qc.removeQueries({ queryKey: roomKeys.detail(id) });
        },
    });
}

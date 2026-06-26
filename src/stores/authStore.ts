import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AdminProfile {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    role: "admin" | "landlord" | "student";
    phone_number?: string;
}

interface AuthState {
    // State
    profile: AdminProfile | null;
    token: string | null;
    loading: boolean;

    // Actions
    setProfile: (profile: AdminProfile | null) => void;
    setToken: (token: string | null) => void;
    setLoading: (loading: boolean) => void;
    reset: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            profile: null,
            token: null,
            loading: true,

            setProfile: (profile) => set({ profile }),
            setToken: (token) => set({ token }),
            setLoading: (loading) => set({ loading }),
            reset: () =>
                set({ profile: null, token: null, loading: false }),
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                token: state.token,
                profile: state.profile,
            }),
        },
    ),
);

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
    // Dark mode
    isDarkMode: boolean;

    // Actions
    toggleDarkMode: () => void;
    setDarkMode: (value: boolean) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            isDarkMode: false,

            toggleDarkMode: () =>
                set((state) => {
                    const next = !state.isDarkMode;
                    document.documentElement.classList.toggle("dark", next);
                    return { isDarkMode: next };
                }),

            setDarkMode: (value) => {
                document.documentElement.classList.toggle("dark", value);
                set({ isDarkMode: value });
            },
        }),
        {
            name: "ui-storage",
            partialize: (state) => ({
                isDarkMode: state.isDarkMode,
            }),
        },
    ),
);

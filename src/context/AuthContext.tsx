"use client";

import React, { createContext, useContext } from "react";
import { useAuthStore, AdminProfile } from "../stores/authStore";
import { queryClient } from "../lib/queryClient";
import apiClient from "../lib/axios";
import { useEffect } from "react";

interface AuthContextType {
    login: (
        email: string,
        password: string,
    ) => Promise<{ success: boolean; error?: string }>;
    register: (
        email: string,
        password: string,
        fullName?: string,
    ) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchProfile(accessToken: string): Promise<AdminProfile | null> {
    try {
        const res = await apiClient.get<AdminProfile>("/users/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return res.data;
    } catch {
        return null;
    }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { setProfile, setToken, setLoading, reset } = useAuthStore();

    useEffect(() => {
        // Kiểm tra token trong store khi load lại trang
        const token = useAuthStore.getState().token;
        if (token) {
            setToken(token);
            fetchProfile(token).then((profile) => {
                if (profile) {
                    setProfile(profile);
                } else {
                    reset();
                }
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const res = await apiClient.post("/auth/login", { email, password });
            const { user, session } = res.data;

            setToken(session.access_token);
            setProfile(user);
            return { success: true };
        } catch (e: any) {
            const msg =
                e.response?.data?.message || e.message || "Đăng nhập thất bại";
            return { success: false, error: msg };
        }
    };

    const register = async (email: string, password: string, fullName?: string) => {
        try {
            const res = await apiClient.post("/auth/register", {
                email,
                password,
                fullName: fullName || email.split("@")[0],
            });
            const { user, session } = res.data;

            setToken(session.access_token);
            setProfile(user);
            return { success: true };
        } catch (e: any) {
            const msg =
                e.response?.data?.message || e.message || "Đăng ký thất bại";
            return { success: false, error: msg };
        }
    };

    const logout = async () => {
        reset();
        queryClient.clear();
    };

    return (
        <AuthContext.Provider value={{ login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useAuthStore } from "../../../stores/authStore";
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff, User } from "lucide-react";

export default function AdminLoginPage() {
    const router = useRouter();
    const { login, register } = useAuth();
    const loading = useAuthStore((s) => s.loading);
    const profile = useAuthStore((s) => s.profile);

    // Auth mode
    const [mode, setMode] = useState<"login" | "register">("login");

    // Form fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Nếu đã login thì redirect về admin dashboard
    React.useEffect(() => {
        if (!loading && profile) {
            router.replace("/admin");
        }
    }, [loading, profile, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (mode === "register" && password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        setIsSubmitting(true);

        const res =
            mode === "login"
                ? await login(email, password)
                : await register(email, password, fullName || undefined);

        if (res.success) {
            router.push("/admin");
        } else {
            setError(res.error || "Thao tác thất bại");
        }
        setIsSubmitting(false);
    };

    const switchMode = () => {
        setMode(mode === "login" ? "register" : "login");
        setError(null);
    };

    // Đang loading session
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Đang tải...
                    </p>
                </div>
            </div>
        );
    }

    // Đã login — redirect (React.useEffect handles this)
    if (profile) {
        return null;
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/5" />
                <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-2xl" />
            </div>

            <div className="w-full max-w-md px-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200/50 dark:shadow-indigo-950/50 mb-4">
                        {mode === "login" ? (
                            <LogIn className="h-8 w-8" />
                        ) : (
                            <UserPlus className="h-8 w-8" />
                        )}
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
                        Admin TroHCM
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {mode === "login"
                            ? "Đăng nhập để quản lý hệ thống tìm trọ sinh viên"
                            : "Tạo tài khoản admin mới"}
                    </p>
                </div>

                {/* Auth Card */}
                <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-xl p-8 shadow-xl dark:border-slate-800/80 dark:bg-slate-800/80">
                    {/* Tabs */}
                    <div className="flex rounded-xl bg-slate-100 dark:bg-slate-700/50 p-1 mb-6">
                        <button
                            type="button"
                            onClick={() => switchMode()}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                                mode === "login"
                                    ? "bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                        >
                            Đăng nhập
                        </button>
                        <button
                            type="button"
                            onClick={() => switchMode()}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                                mode === "register"
                                    ? "bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                        >
                            Đăng ký
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name (only for register) */}
                        {mode === "register" && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Họ tên
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                        <User className="h-4 w-4" />
                                    </span>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) =>
                                            setFullName(e.target.value)
                                        }
                                        placeholder="Admin"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white dark:focus:border-indigo-400"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                    <Mail className="h-4 w-4" />
                                </span>
                                <input
                                    type="email"
                                    required
                                    placeholder="admin@admin"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white dark:focus:border-indigo-400"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                    <Lock className="h-4 w-4" />
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    autoComplete={
                                        mode === "login"
                                            ? "current-password"
                                            : "new-password"
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pl-10 pr-11 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white dark:focus:border-indigo-400"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    {mode === "login"
                                        ? "Đang đăng nhập..."
                                        : "Đang đăng ký..."}
                                </>
                            ) : (
                                <>
                                    {mode === "login" ? (
                                        <LogIn className="h-4 w-4" />
                                    ) : (
                                        <UserPlus className="h-4 w-4" />
                                    )}
                                    {mode === "login"
                                        ? "Đăng nhập"
                                        : "Đăng ký"}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
                    &copy; {new Date().getFullYear()} TroHCM — Hệ thống tìm trọ
                    sinh viên TP.HCM
                </p>
            </div>
        </div>
    );
}

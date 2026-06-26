"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";
import {
    Home,
    Search,
    LogOut,
    Menu,
    X,
    Moon,
    Sun,
    LayoutDashboard,
    Phone,
} from "lucide-react";

export const Navbar: React.FC = () => {
    const { logout } = useAuth();
    const profile = useAuthStore((s) => s.profile);
    const { isDarkMode, toggleDarkMode } = useUIStore();

    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 transition-colors">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none group-hover:scale-105 transition-transform">
                            <Home className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
                            TroHCM
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/"
                            className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
                        >
                            Trang chủ
                        </Link>
                        <Link
                            href="/search"
                            className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                        >
                            <Search className="h-4 w-4" />
                            Tìm kiếm phòng
                        </Link>
                        <Link
                            href="/contact"
                            className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                        >
                            <Phone className="h-4 w-4" />
                            Đăng tin cho thuê
                        </Link>

                        {profile && (
                            <Link
                                href="/admin"
                                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex items-center gap-1.5"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Admin
                            </Link>
                        )}
                    </nav>

                    {/* Desktop Right Side */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={toggleDarkMode}
                            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            {isDarkMode ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                        </button>

                        {profile && (
                            <button
                                onClick={logout}
                                className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-500/20 transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <LogOut className="h-4 w-4" />
                                Đăng xuất
                            </button>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="flex items-center gap-2 md:hidden">
                        <button
                            onClick={toggleDarkMode}
                            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            {isDarkMode ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3 shadow-lg">
                        <Link
                            href="/"
                            onClick={() => setIsMenuOpen(false)}
                            className="block rounded-lg px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            Trang chủ
                        </Link>
                        <Link
                            href="/search"
                            onClick={() => setIsMenuOpen(false)}
                            className="block rounded-lg px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            Tìm kiếm phòng
                        </Link>
                        <Link
                            href="/contact"
                            onClick={() => setIsMenuOpen(false)}
                            className="block rounded-lg px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            Đăng tin cho thuê
                        </Link>

                        {profile && (
                            <>
                                <Link
                                    href="/admin"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block rounded-lg px-3 py-2 text-base font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/20"
                                >
                                    Admin Dashboard
                                </Link>
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        logout();
                                    }}
                                    className="w-full text-left block rounded-lg px-3 py-2 text-base font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer"
                                >
                                    Đăng xuất
                                </button>
                            </>
                        )}
                    </div>
                )}
            </header>
        </>
    );
};

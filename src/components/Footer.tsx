"use client";

import React from "react";
import Link from "next/link";
import { Home, Mail, Phone, MapPin } from "lucide-react";

export const Footer: React.FC = () => {
    return (
        <footer className="mt-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 transition-colors">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand & Mission */}
                    <div className="space-y-4 col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                                <Home className="h-4.5 w-4.5" />
                            </div>
                            <span className="text-lg font-bold text-slate-800 dark:text-white">
                                TroHCM
                            </span>
                        </Link>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                            Nền tảng tìm kiếm phòng trọ hàng đầu dành cho sinh
                            viên tại Thành phố Hồ Chí Minh. Giúp kết nối sinh
                            viên và chủ trọ uy tín, nhanh chóng và dễ dàng hơn
                            bao giờ hết.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider mb-4">
                            Khám phá
                        </h3>
                        <ul className="space-y-2.5">
                            <li>
                                <Link
                                    href="/"
                                    className="text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                                >
                                    Trang chủ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/search"
                                    className="text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                                >
                                    Tìm kiếm phòng trọ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/bookmarks"
                                    className="text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                                >
                                    Trang lưu trữ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Details */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider mb-4">
                            Liên hệ
                        </h3>
                        <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                            <li className="flex items-start gap-2">
                                <MapPin className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
                                <span>Quận 10 & Thủ Đức, TP. Hồ Chí Minh</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                                <span>090 123 4567</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                                <span>support@hcmutro.vn</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-800 my-8" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
                    <p>
                        © {new Date().getFullYear()} TroHCM. All rights
                        reserved.
                    </p>
                    <div className="flex gap-4">
                        <a
                            href="#"
                            className="hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            Điều khoản
                        </a>
                        <a
                            href="#"
                            className="hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            Bảo mật
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

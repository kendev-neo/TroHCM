'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useAuthStore } from '../../stores/authStore';
import { useUpdateProfile } from '../../hooks/useProfile';
import { getErrorMessage } from '../../lib/axios';
import { User, Mail, Phone, Shield, CheckCircle, Info } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const authLoading = useAuthStore((s) => s.loading);
  const updateProfileMutation = useUpdateProfile();

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('student');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  // Sync form states with auth profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone_number || '');
      setRole(profile.role || 'student');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !profile) {
      router.push('/');
    }
  }, [profile, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    try {
      await updateProfileMutation.mutateAsync({
        fullName,
        phoneNumber: phone,
        role: role as any,
        avatarUrl: avatarUrl || undefined,
      });
      setSuccess('Cập nhật hồ sơ thành công!');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      // Lỗi hiển thị từ mutation.error
    }
  };

  const loading = updateProfileMutation.isPending;
  const error = updateProfileMutation.error ? getErrorMessage(updateProfileMutation.error) : null;

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50 py-10 transition-colors">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Hồ Sơ Cá Nhân</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Quản lý thông tin tài khoản, vai trò người dùng và thông tin liên hệ
            </p>
          </div>

          {success && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800/40">
              <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
              <span>{success}</span>
            </div>
          )}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            
            {/* PROFILE DETAILS CARD */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Profile Header Avatar */}
              <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-slate-100 dark:border-slate-700/50 pb-6">
                <div className="h-20 w-20 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-black text-3xl text-indigo-700 dark:text-indigo-300 overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
                  ) : (
                    fullName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">{fullName || 'Người dùng'}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{profile.email}</p>
                  <span className="mt-2 inline-block rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 px-3 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 capitalize">
                    Admin
                  </span>
                </div>
              </div>

              {/* Email (Readonly) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Địa chỉ Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 pl-9 pr-4 text-sm text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Info className="h-3 w-3 shrink-0" /> Email dùng để đăng nhập và không thể thay đổi.
                </p>
              </div>

              {/* Full name input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Họ và Tên *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                  />
                </div>
              </div>

              {/* Phone number input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Số điện thoại liên lạc *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                  />
                </div>
              </div>

              {/* Role selector (Great for testing!) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Shield className="h-4 w-4 text-indigo-500" />
                  Vai trò tài khoản (Sinh viên / Chủ trọ)
                </label>
                <div className="flex gap-4">
                  <label className="flex w-1/2 cursor-pointer items-center justify-center gap-2 rounded-xl border p-3.5 text-sm font-medium transition-all hover:bg-slate-50 dark:hover:bg-slate-900/20 shadow-sm border-slate-200 dark:border-slate-750">
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={role === 'student'}
                      onChange={() => setRole('student')}
                      className="accent-indigo-600"
                    />
                    <span className="text-slate-700 dark:text-slate-200">Sinh viên tìm trọ</span>
                  </label>
                  <label className="flex w-1/2 cursor-pointer items-center justify-center gap-2 rounded-xl border p-3.5 text-sm font-medium transition-all hover:bg-slate-50 dark:hover:bg-slate-900/20 shadow-sm border-slate-200 dark:border-slate-750">
                    <input
                      type="radio"
                      name="role"
                      value="landlord"
                      checked={role === 'landlord'}
                      onChange={() => setRole('landlord')}
                      className="accent-indigo-600"
                    />
                    <span className="text-slate-700 dark:text-slate-200">Chủ trọ cho thuê</span>
                  </label>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-normal">
                  Lưu ý: Bạn có thể thay đổi vai trò tài khoản sang Chủ trọ để kiểm thử chức năng Đăng tin phòng trọ của hệ thống.
                </p>
              </div>

              {/* Avatar Url */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Đường dẫn ảnh đại diện (URL)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-xs font-mono outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer py-4 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 disabled:bg-indigo-400 flex justify-center items-center gap-2 pt-4"
              >
                {loading ? 'Đang lưu...' : 'Cập nhật thông tin'}
              </button>

            </form>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}

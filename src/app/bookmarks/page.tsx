'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useAuthStore } from '../../stores/authStore';
import { useBookmarks, useToggleBookmark } from '../../hooks/useBookmarks';
import { Heart, MapPin, Trash2 } from 'lucide-react';


export default function BookmarksPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const authLoading = useAuthStore((s) => s.loading);

  const { data: bookmarks = [], isLoading } = useBookmarks();
  const toggleBookmark = useToggleBookmark();

  const handleRemoveBookmark = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark.mutate({ roomId, isBookmarked: true });
  };

  const loading = authLoading || isLoading;

  if (authLoading || (loading && profile)) {
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

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50 py-10 transition-colors">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Tin Đăng Đã Lưu</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Quản lý danh sách các phòng trọ bạn đang quan tâm và theo dõi
            </p>
          </div>

          {!profile ? (
            /* Unauthenticated state */
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-md mx-auto">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 mb-4">
                <Heart className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Yêu cầu đăng nhập</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Vui lòng đăng nhập để lưu trữ và quản lý các phòng trọ yêu thích của bạn.
              </p>
              <button
                onClick={() => router.push('/')}
                className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                Về trang chủ để đăng nhập
              </button>
            </div>
          ) : bookmarks.length === 0 ? (
            /* Empty state */
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-8 max-w-md mx-auto">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 mb-4">
                <Heart className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Chưa lưu tin trọ nào</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Hãy khám phá các tin đăng và nhấn nút Yêu thích để lưu lại các phòng trọ phù hợp nhất.
              </p>
              <button
                onClick={() => router.push('/search')}
                className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                Tìm phòng ngay
              </button>
            </div>
          ) : (
            /* Grid of Bookmarked Rooms */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map(({ id, room }) => {
                if (!room) return null;
                return (
                  <div
                    key={id}
                    onClick={() => router.push(`/rooms/${room.id}`)}
                    className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg dark:border-slate-800 dark:bg-slate-800 transition-all flex flex-col h-full relative"
                  >
                    {/* Delete bookmark button */}
                    <button
                      onClick={(e) => handleRemoveBookmark(room.id, e)}
                      className="absolute top-3 right-3 z-10 p-2.5 rounded-xl bg-white/90 border border-slate-100 text-slate-400 hover:text-red-500 dark:bg-slate-800/90 dark:border-slate-750 hover:scale-110 active:scale-95 transition-all shadow-sm cursor-pointer"
                      title="Bỏ lưu"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>

                    {/* Room Image */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0">
                      <img
                        src={room.images && room.images.length > 0 ? room.images[0].url : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=80'}
                        alt={room.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
                      />
                      <div className="absolute bottom-2.5 left-2.5 rounded-lg bg-indigo-600 px-2.5 py-1 text-2xs font-bold uppercase tracking-wider text-white">
                        {room.room_type === 'shared' ? 'Ở ghép' : room.room_type === 'single' ? 'Phòng đơn' : room.room_type === 'apartment' ? 'Căn hộ' : 'Homestay'}
                      </div>
                    </div>

                    {/* Room Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-800 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {room.title}
                      </h3>

                      <div className="mt-2 flex items-center text-xs text-slate-400 gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{room.address}</span>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-end justify-between mt-auto">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Giá thuê</p>
                          <p className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                            {(room.price / 1000000).toFixed(1)} triệu<span className="text-xs font-semibold text-slate-400">/th</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Diện tích</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{room.area} m²</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}

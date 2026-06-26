'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { useAuthStore } from '../../../stores/authStore';
import { useRoom } from '../../../hooks/useRooms';
import { useBookmarks, useToggleBookmark } from '../../../hooks/useBookmarks';
import { MapPin, Building, Heart, Calendar, Phone, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react';


export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);

  const roomId = params.id as string;

  // TanStack Query
  const { data: room, isLoading: loading } = useRoom(roomId);
  const { data: bookmarksData = [] } = useBookmarks();
  const toggleBookmark = useToggleBookmark();

  const isBookmarked = bookmarksData.some((b) => b.room_id === roomId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);

  const handleBookmarkToggle = () => {
    if (!profile) {
      router.push('/admin/login');
      return;
    }
    toggleBookmark.mutate({ roomId, isBookmarked });
  };

  if (loading) {
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

  if (!room) return null;

  const utilitiesMap: Record<string, string> = {
    wifi: 'Mạng Wifi / Internet',
    air_conditioning: 'Điều hòa nhiệt độ',
    parking: 'Chỗ đỗ xe máy',
    fridge: 'Tủ lạnh riêng',
    washing_machine: 'Máy giặt',
    kitchen: 'Khu vực bếp nấu',
    balcony: 'Ban công thoáng'
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50 py-10 transition-colors">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          
          {/* Back button */}
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white mb-6 group transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4.5 w-4.5 group-hover:-translate-x-0.5 transition-transform" />
            Quay lại tìm kiếm
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT SIDE: GALLERY & DETAILS */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* IMAGE GALLERY */}
              <div className="rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-800 shadow-sm overflow-hidden">
                {/* Main image */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                  <img 
                    src={room.images && room.images.length > 0 ? room.images[activeImageIndex].url : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'} 
                    alt={room.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
                    {room.room_type === 'shared' ? 'Ở ghép' : room.room_type === 'single' ? 'Phòng đơn' : room.room_type === 'apartment' ? 'Căn hộ' : 'Homestay'}
                  </div>
                </div>

                {/* Thumbnails */}
                {room.images && room.images.length > 1 && (
                  <div className="flex gap-2.5 mt-2.5 px-1 pb-1 overflow-x-auto">
                    {room.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`relative h-16 w-24 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          activeImageIndex === index ? 'border-indigo-600' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt={`Thumbnail ${index}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* CORE DETAILS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-800 shadow-sm space-y-5">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-white leading-snug">
                    {room.title}
                  </h1>
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 gap-1.5 mt-2.5">
                    <MapPin className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <span>{room.address}</span>
                  </div>
                </div>

                {/* Metrics boxes */}
                <div className="grid grid-cols-3 gap-4 border-y border-slate-100 dark:border-slate-700/50 py-4">
                  <div>
                    <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Giá phòng</p>
                    <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1">
                      {(room.price / 1000000).toFixed(1)} triệu<span className="text-xs font-semibold text-slate-400">/th</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Diện tích</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200 mt-1">
                      {room.area} m²
                    </p>
                  </div>
                  <div>
                    <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Loại trọ</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1.5 capitalize">
                      {room.room_type === 'shared' ? 'Ở ghép' : room.room_type === 'single' ? 'Phòng đơn' : room.room_type === 'apartment' ? 'Căn hộ' : 'Homestay'}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-white mb-2.5">Mô tả chi tiết</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {room.description || 'Không có mô tả chi tiết từ chủ phòng.'}
                  </p>
                </div>

                {/* Utilities */}
                <div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-white mb-3">Tiện ích sẵn có</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {room.utilities && room.utilities.map((util) => (
                      <div key={util} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                        <span>{utilitiesMap[util] || util}</span>
                      </div>
                    ))}
                    {(!room.utilities || room.utilities.length === 0) && (
                      <p className="text-xs text-slate-400">Không có tiện ích nào được liệt kê.</p>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT SIDE: CONTACT & ACTION PANEL */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* LANDLORD CARD */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-800 shadow-sm space-y-6">
                <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700/50 pb-3">
                  Liên hệ chủ tin đăng
                </h3>

                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-lg text-indigo-700 dark:text-indigo-300 shrink-0">
                    {room.landlord?.avatar_url ? (
                      <img src={room.landlord.avatar_url} alt={room.landlord.full_name} className="h-full w-full object-cover rounded-xl" />
                    ) : (
                      room.landlord?.full_name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{room.landlord?.full_name || 'Chủ trọ'}</h4>
                    <p className="text-xs text-slate-400">{room.landlord?.email || ''}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-3.5 flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mức độ uy tín</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Thông tin đã xác minh</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Phone Button */}
                  <button
                    onClick={() => setShowPhone(true)}
                    className="w-full cursor-pointer py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Phone className="h-4.5 w-4.5" />
                    {showPhone ? (
                      <a href={`tel:${room.landlord?.phone_number || '0901234567'}`} className="hover:underline">
                        {room.landlord?.phone_number || '090 123 4567'}
                      </a>
                    ) : (
                      'Hiện số điện thoại'
                    )}
                  </button>

                  {/* Bookmark Button */}
                  <button
                    onClick={handleBookmarkToggle}
                    className={`w-full cursor-pointer py-3.5 rounded-xl border font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${
                      isBookmarked
                        ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-950/30 dark:bg-red-950/20 dark:text-red-400'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750'
                    }`}
                  >
                    <Heart className={`h-4.5 w-4.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    {isBookmarked ? 'Đã lưu phòng này' : 'Lưu tin đăng'}
                  </button>
                </div>
              </div>

              {/* SECURITY GUIDELINES CARD */}
              <div className="rounded-2xl border border-slate-100 bg-amber-50/50 p-6 dark:border-slate-800/60 dark:bg-amber-950/10 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  Lưu ý an toàn khi thuê trọ
                </h4>
                <ul className="text-xs text-amber-700/90 dark:text-amber-500/90 space-y-2 list-disc pl-4 leading-relaxed">
                  <li>Không đặt cọc giữ chỗ khi chưa đến xem phòng trực tiếp.</li>
                  <li>Yêu cầu chủ trọ xuất trình giấy tờ sở hữu phòng hoặc hợp đồng ký gửi hợp lệ.</li>
                  <li>Đọc kỹ tất cả các điều khoản về tiền đặt cọc, chi phí dịch vụ (điện, nước, internet, phí xe...) trong hợp đồng thuê nhà trước khi ký kết.</li>
                </ul>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}

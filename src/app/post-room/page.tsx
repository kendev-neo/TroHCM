'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useAuthStore } from '../../stores/authStore';
import { useCreateRoom } from '../../hooks/useRooms';
import { getErrorMessage } from '../../lib/axios';
import { PlusCircle, Info, Image as ImageIcon, MapPin, DollarSign, Home, CheckCircle2 } from 'lucide-react';
import { CustomSelect } from '../../components/CustomSelect';

export default function PostRoomPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const authLoading = useAuthStore((s) => s.loading);
  const createRoom = useCreateRoom();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [roomType, setRoomType] = useState('single');
  const [address, setAddress] = useState('');
  const [ward, setWard] = useState('');
  const [district, setDistrict] = useState('Quận 10');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [utilities, setUtilities] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState(
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80\nhttps://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80'
  );

  const [success, setSuccess] = useState<string | null>(null);

  const districts = [
    'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 10', 'Quận 11', 'Quận 12',
    'Bình Thạnh', 'Thủ Đức', 'Gò Vấp', 'Phú Nhuận', 'Tân Bình', 'Tân Phú', 'Bình Tân',
    'Bình Chánh', 'Hóc Môn', 'Củ Chi', 'Nhà Bè', 'Cần Giờ'
  ];

  const districtOptions = districts.map((d) => ({
    value: d,
    label: d,
  }));

  const roomTypeOptions = [
    { value: 'single', label: 'Phòng đơn' },
    { value: 'shared', label: 'Ký túc xá / Ở ghép' },
    { value: 'apartment', label: 'Căn hộ dịch vụ' },
    { value: 'homestay', label: 'Nhà nguyên căn / Homestay' },
  ];

  const utilitiesList = [
    { id: 'wifi', label: 'Mạng Wifi / Internet' },
    { id: 'air_conditioning', label: 'Điều hòa nhiệt độ' },
    { id: 'parking', label: 'Chỗ để xe máy' },
    { id: 'fridge', label: 'Tủ lạnh riêng' },
    { id: 'washing_machine', label: 'Máy giặt' },
    { id: 'kitchen', label: 'Khu vực bếp nấu' },
    { id: 'balcony', label: 'Ban công thoáng mát' }
  ];

  // District center coordinates for quick default geocoding helper
  const districtCoordinates: Record<string, { lat: number; lng: number }> = {
    'Quận 1': { lat: 10.776019, lng: 106.701503 },
    'Quận 3': { lat: 10.779776, lng: 106.681604 },
    'Quận 4': { lat: 10.763445, lng: 106.703444 },
    'Quận 5': { lat: 10.758066, lng: 106.662758 },
    'Quận 7': { lat: 10.732383, lng: 106.699742 },
    'Quận 10': { lat: 10.772592, lng: 106.657789 },
    'Thủ Đức': { lat: 10.850632, lng: 106.771908 },
    'Gò Vấp': { lat: 10.822214, lng: 106.687508 },
    'Bình Thạnh': { lat: 10.810583, lng: 106.709142 }
  };

  useEffect(() => {
    // Prefill coordinates when district changes
    const coords = districtCoordinates[district];
    if (coords) {
      setLatitude(coords.lat.toString());
      setLongitude(coords.lng.toString());
    }
  }, [district]);

  const handleUtilityToggle = (id: string) => {
    setUtilities((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);

    // Format image URLs
    const images = imageUrls
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    try {
      const room = await createRoom.mutateAsync({
        title,
        description,
        price: parseInt(price, 10),
        area: parseFloat(area),
        roomType,
        address,
        ward,
        district,
        utilities,
        images,
      });
      setSuccess('Đăng tin trọ thành công! Tin đăng đã được hiển thị trên hệ thống.');
      setTimeout(() => router.push(`/rooms/${room.id}`), 1500);
    } catch {
      // Lỗi từ createRoom.error
    }
  };

  const loading = createRoom.isPending;
  const error = createRoom.error ? getErrorMessage(createRoom.error) : null;

  // Redirect if unauthorized
  useEffect(() => {
    if (!authLoading && !profile) {
      router.push('/');
    }
  }, [profile, authLoading]);

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

  if (!profile || (profile.role !== 'admin' && profile.role !== 'landlord')) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 mb-4">
              <Info className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Quyền truy cập bị từ chối</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Chỉ tài khoản Chủ trọ hoặc Admin mới có quyền đăng tin cho thuê phòng. Vui lòng chuyển vai trò tài khoản trong trang cá nhân của bạn.
            </p>
            <button
              onClick={() => router.push('/profile')}
              className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-all cursor-pointer"
            >
              Đi tới trang cá nhân
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50 py-10 transition-colors">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <PlusCircle className="h-8 w-8 text-indigo-600" />
              Đăng Tin Cho Thuê Phòng
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Cung cấp đầy đủ thông tin phòng trọ để thu hút sinh viên liên hệ
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800/40">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            
            <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700/50 pb-3">
              1. Thông tin chung
            </h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tiêu đề tin đăng *</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Phòng trọ khép kín full nội thất gần ĐH Bách Khoa..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Mô tả chi tiết *</label>
              <textarea
                required
                rows={5}
                placeholder="Nhập thông tin mô tả chi tiết: tiền điện nước, dịch vụ tòa nhà, giờ giấc, nội thất có sẵn, tiện ích xung quanh..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Price */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Giá thuê (VND / Tháng) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="Ví dụ: 3000000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                  />
                </div>
              </div>

              {/* Area */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Diện tích (m²) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Ví dụ: 25"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                />
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Loại hình thuê *</label>
                <CustomSelect
                  options={roomTypeOptions}
                  value={roomType}
                  onChange={setRoomType}
                  placeholder="Chọn loại hình thuê"
                  triggerClassName="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white py-3"
                />
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700/50 pb-3 pt-4">
              2. Vị trí phòng trọ
            </h3>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Địa chỉ số nhà, tên đường *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 268 Lý Thường Kiệt"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Ward */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Phường / Xã *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Phường 14"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                />
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Quận / Huyện *</label>
                <CustomSelect
                  options={districtOptions}
                  value={district}
                  onChange={setDistrict}
                  placeholder="Chọn Quận / Huyện"
                  showSearch={true}
                  triggerClassName="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white py-3"
                />
              </div>
            </div>

            {/* Coordinates (Helpful for radius calculation) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Vĩ độ (Latitude) - Tự động cập nhật</label>
                <input
                  type="number"
                  step="any"
                  placeholder="Vĩ độ (ví dụ: 10.772)"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/10 py-3 px-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/20 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Kinh độ (Longitude) - Tự động cập nhật</label>
                <input
                  type="number"
                  step="any"
                  placeholder="Kinh độ (ví dụ: 106.657)"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/10 py-3 px-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/20 dark:text-white"
                />
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700/50 pb-3 pt-4">
              3. Tiện ích & Hình ảnh
            </h3>

            {/* Utilities Checklist */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Tiện ích đi kèm</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {utilitiesList.map((util) => (
                  <label
                    key={util.id}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-medium cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-900/40 ${
                      utilities.includes(util.id)
                        ? 'border-indigo-500 bg-indigo-50/30 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/20 dark:text-indigo-300'
                        : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={utilities.includes(util.id)}
                      onChange={() => handleUtilityToggle(util.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                    />
                    <span>{util.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Images list */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-indigo-500" />
                Đường dẫn hình ảnh (URL - Mỗi URL một dòng)
              </label>
              <textarea
                rows={3}
                placeholder="Nhập link ảnh online (ví dụ: https://unsplash.com/...)"
                value={imageUrls}
                onChange={(e) => setImageUrls(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-xs font-mono outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
              />
              <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                Gợi ý: Hệ thống đã điền sẵn một số link ảnh phòng mẫu tuyệt đẹp từ Unsplash để bạn thử nghiệm.
              </p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer py-4 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 disabled:bg-indigo-400 flex justify-center items-center gap-2 mt-6"
            >
              {loading ? 'Đang xử lý đăng tin...' : 'Đăng tin phòng trọ ngay'}
            </button>

          </form>

        </div>
      </main>

      <Footer />
    </>
  );
}

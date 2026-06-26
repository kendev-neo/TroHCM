'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ImageUploader } from '../../components/ImageUploader';
import { useCreateContact } from '../../hooks/useContacts';
import { getErrorMessage } from '../../lib/axios';
import { Phone, Mail, User, PlusCircle, CheckCircle2, DollarSign, MapPin, Building } from 'lucide-react';
import { CustomSelect } from '../../components/CustomSelect';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function ContactPage() {
  const router = useRouter();
  const createContact = useCreateContact();

  // Form states
  const [landlordName, setLandlordName] = useState('');
  const [landlordPhone, setLandlordPhone] = useState('');
  const [landlordEmail, setLandlordEmail] = useState('');

  const [roomTitle, setRoomTitle] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomPrice, setRoomPrice] = useState('');
  const [roomArea, setRoomArea] = useState('');
  const [roomType, setRoomType] = useState('single');
  const [roomAddress, setRoomAddress] = useState('');
  const [roomWard, setRoomWard] = useState('');
  const [roomDistrict, setRoomDistrict] = useState('Quận 10');

  const [roomUtilities, setRoomUtilities] = useState<string[]>([]);
  const [roomImages, setRoomImages] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  const districts = [
    'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 10', 'Quận 11', 'Quận 12',
    'Bình Thạnh', 'Thủ Đức', 'Gò Vấp', 'Phú Nhuận', 'Tân Bình', 'Tân Bình', 'Bình Tân',
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

  // Prefill demo data to make it super easy for the user to test!
  const prefillDemoData = () => {
    setLandlordName('Bác Ba (Chủ trọ)');
    setLandlordPhone('0909999888');
    setLandlordEmail('bacba.chutro@gmail.com');
    setRoomTitle('Phòng trọ giá rẻ khép kín, sạch đẹp gần ĐH Bách Khoa');
    setRoomDescription('Phòng trọ khép kín mới sơn sửa cực kỳ sạch đẹp, giờ giấc tự do không chung chủ. Có camera an ninh nhà xe. Gần các hàng ăn sinh viên rẻ Quận 10.');
    setRoomPrice('3000000');
    setRoomArea('22');
    setRoomType('single');
    setRoomAddress('15/2 Tô Hiến Thành');
    setRoomWard('Phường 13');
    setRoomDistrict('Quận 10');
    setRoomUtilities(['wifi', 'parking', 'fridge']);
  };

  const handleUtilityToggle = (id: string) => {
    setRoomUtilities((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContact.mutateAsync({
        landlordName,
        landlordPhone,
        landlordEmail,
        roomTitle,
        roomDescription,
        roomPrice: parseInt(roomPrice, 10),
        roomArea: parseFloat(roomArea),
        roomType,
        roomAddress,
        roomWard,
        roomDistrict,
        roomUtilities,
        roomImages,
      });
      setSuccess('Yêu cầu đăng tin của bạn đã được gửi thành công! Admin sẽ duyệt tin và đăng lên trang chủ sớm nhất.');
      resetForm();
    } catch (err) {
      // Lỗi được lưu trong createContact.error
    }
  };

  const loading = createContact.isPending;
  const error = createContact.error ? getErrorMessage(createContact.error) : null;

  const resetForm = () => {
    setLandlordName('');
    setLandlordPhone('');
    setLandlordEmail('');
    setRoomTitle('');
    setRoomDescription('');
    setRoomPrice('');
    setRoomArea('');
    setRoomAddress('');
    setRoomWard('');
    setRoomUtilities([]);
    setRoomImages([]);
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50 py-10 transition-colors">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                <PlusCircle className="h-8 w-8 text-indigo-600" />
                Đăng ký Đăng tin Phòng trọ
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Chủ trọ vui lòng điền thông tin liên hệ và chi tiết phòng để gửi đề xuất đăng tin lên hệ thống
              </p>
            </div>
            
            <button
              type="button"
              onClick={prefillDemoData}
              className="rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 px-4 py-2.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/20 dark:text-indigo-400 transition-colors cursor-pointer"
            >
              Nạp thông tin thử nghiệm (Demo)
            </button>
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
            
            {/* SECTION 1: LANDLORD INFO */}
            <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700/50 pb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-500" />
              1. Thông tin liên hệ Chủ trọ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Họ và Tên *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bác Ba"
                  value={landlordName}
                  onChange={(e) => setLandlordName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Số điện thoại *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="09xxxxxxxx"
                    value={landlordPhone}
                    onChange={(e) => setLandlordPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={landlordEmail}
                    onChange={(e) => setLandlordEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: ROOM DETAILS */}
            <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700/50 pb-3 pt-4 flex items-center gap-2">
              <Building className="h-5 w-5 text-indigo-500" />
              2. Chi tiết phòng trọ
            </h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tiêu đề phòng trọ *</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Phòng trọ cao cấp Studio gác lửng..."
                value={roomTitle}
                onChange={(e) => setRoomTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Mô tả chi tiết phòng trọ *</label>
              <textarea
                required
                rows={4}
                placeholder="Nhập mô tả về nội thất, giờ giấc, tiền điện/nước, chi phí dịch vụ khác..."
                value={roomDescription}
                onChange={(e) => setRoomDescription(e.target.value)}
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
                    value={roomPrice}
                    onChange={(e) => setRoomPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                  />
                </div>
              </div>

              {/* Area */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Diện tích (m²) *</label>
                <input
                  type="number"
                  required
                  placeholder="Ví dụ: 25"
                  value={roomArea}
                  onChange={(e) => setRoomArea(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                />
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Loại hình phòng *</label>
                <CustomSelect
                  options={roomTypeOptions}
                  value={roomType}
                  onChange={setRoomType}
                  placeholder="Chọn loại hình phòng"
                  triggerClassName="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white py-3"
                />
              </div>
            </div>

            {/* SECTION 3: ADDRESS */}
            <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700/50 pb-3 pt-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-500" />
              3. Vị trí và Tiện ích
            </h3>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Địa chỉ số nhà, tên đường *</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: 15/2 Tô Hiến Thành"
                value={roomAddress}
                onChange={(e) => setRoomAddress(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Ward */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Phường / Xã *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Phường 13"
                  value={roomWard}
                  onChange={(e) => setRoomWard(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                />
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Quận / Huyện *</label>
                <CustomSelect
                  options={districtOptions}
                  value={roomDistrict}
                  onChange={setRoomDistrict}
                  placeholder="Chọn Quận / Huyện"
                  showSearch={true}
                  triggerClassName="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white py-3"
                />
              </div>
            </div>

            {/* Utilities */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Tiện ích đi kèm</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {utilitiesList.map((util) => (
                  <label
                    key={util.id}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-medium cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-900/40 ${
                      roomUtilities.includes(util.id)
                        ? 'border-indigo-500 bg-indigo-50/30 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/20 dark:text-indigo-300'
                        : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={roomUtilities.includes(util.id)}
                      onChange={() => handleUtilityToggle(util.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                    />
                    <span>{util.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Images - thay bằng component upload thật */}
            <div>
              <ImageUploader
                label="Ảnh phòng trọ (kéo & thả hoặc click để chọn)"
                value={roomImages}
                onChange={setRoomImages}
                maxImages={8}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer py-4 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 disabled:bg-indigo-400 flex justify-center items-center gap-2 mt-6"
            >
              {loading ? 'Đang gửi thông tin...' : 'Gửi yêu cầu đăng tin phòng'}
            </button>

          </form>

        </div>
      </main>

      <Footer />
    </>
  );
}

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, ImagePlus, AlertCircle } from 'lucide-react';

import { useUploadImage } from '../hooks/useUpload';

interface ImageUploaderProps {
  /** Danh sách URL ảnh hiện tại */
  value: string[];
  /** Callback khi danh sách ảnh thay đổi */
  onChange: (urls: string[]) => void;
  /** Số ảnh tối đa cho phép (mặc định: 10) */
  maxImages?: number;
  /** Label hiển thị */
  label?: string;
}

interface UploadingFile {
  id: string;
  preview: string;
  progress: number; // 0–100
  error?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value = [],
  onChange,
  maxImages = 10,
  label = 'Ảnh phòng trọ',
}) => {
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: uploadImage } = useUploadImage();

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    try {
      const url = await uploadImage(file);
      return url;
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || err.message || 'Upload thất bại');
    }
  }, [uploadImage]);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = maxImages - value.length;
      const toUpload = fileArray.slice(0, remaining);

      if (toUpload.length === 0) return;

      // Thêm preview ngay lập tức
      const newUploading: UploadingFile[] = toUpload.map((f) => ({
        id: `${Date.now()}-${Math.random()}`,
        preview: URL.createObjectURL(f),
        progress: 0,
      }));
      setUploading((prev) => [...prev, ...newUploading]);

      // Upload từng file
      const successUrls: string[] = [];
      await Promise.all(
        toUpload.map(async (file, i) => {
          const uid = newUploading[i].id;
          try {
            // Simulate progress
            setUploading((prev) =>
              prev.map((u) => (u.id === uid ? { ...u, progress: 30 } : u)),
            );
            const url = await uploadFile(file);
            setUploading((prev) =>
              prev.map((u) => (u.id === uid ? { ...u, progress: 100 } : u)),
            );
            if (url) successUrls.push(url);
          } catch (err: any) {
            setUploading((prev) =>
              prev.map((u) =>
                u.id === uid ? { ...u, error: err.message, progress: 0 } : u,
              ),
            );
          }
        }),
      );

      // Dọn sạch uploading list sau 800ms
      setTimeout(() => {
        setUploading((prev) =>
          prev.filter((u) => !newUploading.find((nu) => nu.id === u.id)),
        );
        newUploading.forEach((u) => URL.revokeObjectURL(u.preview));
      }, 800);

      if (successUrls.length > 0) {
        onChange([...value, ...successUrls]);
      }
    },
    [value, maxImages, onChange, uploadFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
    },
    [processFiles],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(e.target.files);
      // Reset input để chọn lại cùng file nếu muốn
      e.target.value = '';
    },
    [processFiles],
  );

  const removeImage = (url: string) => {
    onChange(value.filter((u) => u !== url));
  };

  const canAddMore = value.length + uploading.length < maxImages;

  return (
    <div>
      {label && (
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          {label}
          <span className="ml-2 font-normal text-slate-400 normal-case">
            ({value.length}/{maxImages} ảnh)
          </span>
        </label>
      )}

      {/* Grid hiển thị ảnh đã upload + ảnh đang upload */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
        {/* Ảnh đã upload thành công */}
        {value.map((url) => (
          <div key={url} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <img src={url} alt="Ảnh phòng trọ" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {/* Ảnh đang upload (preview + progress) */}
        {uploading.map((u) => (
          <div key={u.id} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <img src={u.preview} alt="" className="h-full w-full object-cover opacity-50" />
            {u.error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50/80 dark:bg-red-950/60 p-1">
                <AlertCircle className="h-5 w-5 text-red-600 mb-1" />
                <p className="text-[10px] text-red-700 dark:text-red-400 text-center leading-tight">{u.error}</p>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin mb-1" />
                <p className="text-[10px] text-white font-semibold">{u.progress}%</p>
              </div>
            )}
          </div>
        ))}

        {/* Nút thêm ảnh */}
        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all cursor-pointer
              ${dragOver
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 scale-[1.02]'
                : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
          >
            <ImagePlus className={`h-6 w-6 ${dragOver ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span className={`text-[10px] font-semibold ${dragOver ? 'text-indigo-600' : 'text-slate-400'}`}>
              {dragOver ? 'Thả vào đây' : 'Thêm ảnh'}
            </span>
          </button>
        )}
      </div>

      {/* Dropzone lớn khi chưa có ảnh nào */}
      {value.length === 0 && uploading.length === 0 && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 transition-all cursor-pointer
            ${dragOver
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
              : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
        >
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors
            ${dragOver ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
            <Upload className={`h-7 w-7 ${dragOver ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {dragOver ? 'Thả ảnh vào đây!' : 'Kéo & thả ảnh hoặc click để chọn'}
            </p>
            <p className="text-xs text-slate-400 mt-1">JPEG, PNG, WebP, GIF · Tối đa 5MB/ảnh · {maxImages} ảnh</p>
          </div>
        </div>
      )}

      {/* Input file ẩn */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  showSearch?: boolean;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  /** Custom render cho trigger button */
  renderTrigger?: (selectedOption?: SelectOption) => React.ReactNode;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  icon,
  showSearch = false,
  className = '',
  triggerClassName = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Tìm option hiện tại đang chọn
  const selectedOption = options.find((opt) => opt.value === value);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus vào ô tìm kiếm khi mở dropdown
  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      // Small timeout to ensure element is visible before focusing
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showSearch]);

  // Reset search query khi đóng dropdown
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  // Lọc options dựa trên tìm kiếm (không phân biệt hoa thường và hỗ trợ tiếng Việt có dấu cơ bản)
  const removeVietnameseTones = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  };

  const filteredOptions = options.filter((opt) => {
    const rawLabel = opt.label.toLowerCase();
    const rawSearch = searchQuery.toLowerCase();
    const subLabel = opt.sublabel?.toLowerCase() || '';

    // So khớp trực tiếp hoặc so khớp không dấu
    const matchDirect = rawLabel.includes(rawSearch) || subLabel.includes(rawSearch);
    const matchNoTones = removeVietnameseTones(rawLabel).includes(removeVietnameseTones(rawSearch)) ||
                         removeVietnameseTones(subLabel).includes(removeVietnameseTones(rawSearch));

    return matchDirect || matchNoTones;
  });

  return (
    <div ref={containerRef} className={`relative w-full ${isOpen ? 'z-30' : 'z-10'} ${className}`}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-left text-sm text-slate-700 shadow-sm transition-all duration-200 outline-none
          dark:border-slate-700/80 dark:bg-slate-900/60 dark:text-slate-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 cursor-pointer'}
          ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/10' : ''} ${triggerClassName}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
          <span className="truncate">
            {selectedOption ? (
              <>
                {selectedOption.sublabel && (
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 mr-1.5 shrink-0">
                    {selectedOption.sublabel}
                  </span>
                )}
                {selectedOption.label}
              </>
            ) : (
              <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>
            )}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`}
        />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-full z-50 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 overflow-hidden transform origin-top animate-in fade-in slide-in-from-top-1 duration-200">
          {/* SEARCH BAR */}
          {showSearch && (
            <div className="relative border-b border-slate-100 dark:border-slate-800/80 p-2">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full rounded-lg bg-slate-50 dark:bg-slate-900/60 py-1.5 pl-8 pr-7 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {/* OPTIONS LIST */}
          <ul className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`flex w-full items-center justify-between py-2 px-3.5 text-left text-sm cursor-pointer transition-colors
                        ${isSelected
                          ? 'bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 font-medium'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/40'
                        }`}
                    >
                      <div className="flex items-center min-w-0 mr-2">
                        {opt.sublabel && (
                          <span className={`font-semibold mr-1.5 shrink-0 px-1 py-0.5 rounded text-[10px] ${
                            isSelected ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {opt.sublabel}
                          </span>
                        )}
                        <span className="truncate">{opt.label}</span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="py-4 px-3.5 text-center text-xs text-slate-400 dark:text-slate-500">
                Không tìm thấy kết quả
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

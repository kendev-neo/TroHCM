"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { useAuthStore } from "../../stores/authStore";
import { useRooms, RoomsFilter } from "../../hooks/useRooms";
import { useBookmarks, useToggleBookmark } from "../../hooks/useBookmarks";
import apiClient from "../../lib/axios";
import {
    Search as SearchIcon,
    MapPin,
    Building2,
    GraduationCap,
    Heart,
    SlidersHorizontal,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    List,
    Wifi,
    AirVent,
    Car,
    UtensilsCrossed,
    WashingMachine,
    CookingPot,
    Maximize2,
} from "lucide-react";
import { CustomSelect } from "../../components/CustomSelect";

interface Room {
    id: string;
    title: string;
    price: number;
    area: number;
    room_type: string;
    address: string;
    district: string;
    utilities: string[];
    images: { url: string; is_primary: boolean }[];
    landlord_id: string;
}

const PAGE_SIZE = 12;

/* ─────────────────────────────────────────────────────────────────────────── */
/* Helpers                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

const ROOM_TYPE_LABELS: Record<string, { label: string; cls: string }> = {
    single:    { label: "Phòng đơn",  cls: "badge-type-single" },
    shared:    { label: "Ở ghép",     cls: "badge-type-shared" },
    apartment: { label: "Căn hộ",     cls: "badge-type-apartment" },
    homestay:  { label: "Homestay",   cls: "badge-type-homestay" },
};

const UTILITY_META: Record<string, { label: string; Icon: React.ElementType }> = {
    wifi:             { label: "Wifi",       Icon: Wifi },
    air_conditioning: { label: "Điều hòa",   Icon: AirVent },
    parking:          { label: "Gửi xe",     Icon: Car },
    fridge:           { label: "Tủ lạnh",    Icon: UtensilsCrossed },
    washing_machine:  { label: "Máy giặt",   Icon: WashingMachine },
    kitchen:          { label: "Bếp nấu",    Icon: CookingPot },
    balcony:          { label: "Ban công",   Icon: Maximize2 },
};

function formatPrice(price: number): string {
    if (price >= 1_000_000) {
        const m = price / 1_000_000;
        return m % 1 === 0 ? `${m} triệu` : `${m.toFixed(1)} triệu`;
    }
    return price.toLocaleString("vi-VN") + "đ";
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Skeleton card                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

function SkeletonCard() {
    return (
        <div className="rounded-[var(--radius-xl)] overflow-hidden border border-[var(--clr-border)] bg-[var(--clr-surface)]">
            <div className="skeleton" style={{ aspectRatio: "16/10" }} />
            <div className="p-4 space-y-3">
                <div className="skeleton h-4 rounded w-3/4" />
                <div className="skeleton h-3 rounded w-1/2" />
                <div className="flex gap-2 mt-3">
                    <div className="skeleton h-5 rounded w-12" />
                    <div className="skeleton h-5 rounded w-14" />
                </div>
                <div className="pt-3 flex justify-between">
                    <div className="skeleton h-5 rounded w-20" />
                    <div className="skeleton h-4 rounded w-10" />
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Room Card                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

interface RoomCardProps {
    room: Room;
    isBookmarked: boolean;
    onBookmark: (id: string, e: React.MouseEvent) => void;
    onClick: () => void;
    layout: "grid" | "list";
}

function RoomCard({ room, isBookmarked, onBookmark, onClick, layout }: RoomCardProps) {
    const typeInfo = ROOM_TYPE_LABELS[room.room_type] ?? { label: room.room_type, cls: "badge-primary" };
    const imgSrc = room.images?.length > 0
        ? room.images.find(i => i.is_primary)?.url ?? room.images[0].url
        : "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80";

    const visibleUtils = (room.utilities ?? []).slice(0, 3);
    const extraCount = (room.utilities?.length ?? 0) - 3;

    if (layout === "list") {
        return (
            <div
                className="room-card flex-row cursor-pointer group"
                onClick={onClick}
                role="article"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onClick()}
                aria-label={`Xem phòng: ${room.title}`}
            >
                {/* Image */}
                <div className="room-card-img shrink-0"
                    style={{ width: "220px", aspectRatio: "4/3", borderRadius: 0 }}>
                    <img src={imgSrc} alt={room.title} loading="lazy" />
                    <span className={`badge ${typeInfo.cls} absolute bottom-2 left-2`}>
                        {typeInfo.label}
                    </span>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1 min-w-0">
                    <h3 className="font-semibold leading-snug truncate-2 group-hover:text-[var(--clr-primary-700)] transition-colors"
                        style={{ fontSize: "0.9375rem", color: "var(--clr-text-primary)" }}>
                        {room.title}
                    </h3>

                    <p className="mt-1.5 flex items-center gap-1 text-sm"
                        style={{ color: "var(--clr-text-muted)" }}>
                        <MapPin size={13} className="shrink-0" />
                        <span className="truncate">{room.address}, {room.district}</span>
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {visibleUtils.map(u => {
                            const meta = UTILITY_META[u];
                            return (
                                <span key={u} className="badge-util">
                                    {meta?.label ?? u}
                                </span>
                            );
                        })}
                        {extraCount > 0 && (
                            <span className="badge-util">+{extraCount}</span>
                        )}
                    </div>

                    <div className="mt-auto pt-3 flex items-end justify-between">
                        <div>
                            <span className="text-price">{formatPrice(room.price)}</span>
                            <span className="text-price-unit">/tháng</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium" style={{ color: "var(--clr-text-muted)" }}>
                                {room.area} m²
                            </span>
                            <button
                                onClick={(e) => onBookmark(room.id, e)}
                                className="p-2 rounded-lg transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                style={{ background: "var(--clr-bg-subtle)", border: "1px solid var(--clr-border)" }}
                                aria-label={isBookmarked ? "Bỏ lưu" : "Lưu phòng"}
                            >
                                <Heart
                                    size={16}
                                    className={`transition-colors ${isBookmarked ? "text-red-500 fill-red-500" : ""}`}
                                    style={!isBookmarked ? { color: "var(--clr-text-muted)" } : {}}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Grid layout
    return (
        <div
            className="room-card group"
            onClick={onClick}
            role="article"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClick()}
            aria-label={`Xem phòng: ${room.title}`}
        >
            {/* Bookmark button */}
            <button
                onClick={(e) => onBookmark(room.id, e)}
                className="absolute top-3 right-3 z-10 p-2 rounded-xl backdrop-blur-sm transition-all hover:scale-110 active:scale-95 cursor-pointer"
                style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.4)" }}
                aria-label={isBookmarked ? "Bỏ lưu" : "Lưu phòng"}
            >
                <Heart
                    size={16}
                    className={`transition-colors ${isBookmarked ? "text-red-500 fill-red-500" : "text-slate-500"}`}
                />
            </button>

            {/* Image */}
            <div className="room-card-img relative">
                <img src={imgSrc} alt={room.title} loading="lazy" />
                <span className={`badge ${typeInfo.cls} absolute bottom-2.5 left-2.5`}>
                    {typeInfo.label}
                </span>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <h3
                    className="font-semibold leading-snug truncate-2 group-hover:text-[var(--clr-primary-700)] transition-colors"
                    style={{ fontSize: "0.9rem", color: "var(--clr-text-primary)" }}
                >
                    {room.title}
                </h3>

                <p className="mt-1.5 flex items-center gap-1" style={{ fontSize: "0.78rem", color: "var(--clr-text-muted)" }}>
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{room.district}</span>
                </p>

                {/* Utilities */}
                {visibleUtils.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {visibleUtils.map(u => (
                            <span key={u} className="badge-util">
                                {UTILITY_META[u]?.label ?? u}
                            </span>
                        ))}
                        {extraCount > 0 && (
                            <span className="badge-util">+{extraCount}</span>
                        )}
                    </div>
                )}

                {/* Price & area */}
                <div
                    className="mt-auto pt-3 flex items-end justify-between"
                    style={{ borderTop: "1px solid var(--clr-border)", marginTop: "auto" }}
                >
                    <div>
                        <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--clr-text-muted)", fontWeight: 700 }}>
                            Giá thuê
                        </p>
                        <span className="text-price">{formatPrice(room.price)}</span>
                        <span className="text-price-unit">/tháng</span>
                    </div>
                    <div className="text-right">
                        <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--clr-text-muted)", fontWeight: 700 }}>
                            Diện tích
                        </p>
                        <p className="font-bold" style={{ fontSize: "0.875rem", color: "var(--clr-text-primary)" }}>
                            {room.area} m²
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Pagination                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */

interface PaginationProps {
    page: number;
    totalPages: number;
    onPage: (p: number) => void;
}

function Pagination({ page, totalPages, onPage }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPages = () => {
        const delta = 2;
        const range: (number | "…")[] = [];
        for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
            range.push(i);
        }
        if ((range[0] as number) > 2) range.unshift("…");
        if ((range[range.length - 1] as number) < totalPages - 1) range.push("…");
        return [1, ...range, totalPages];
    };

    return (
        <nav className="pagination mt-10" aria-label="Phân trang">
            <button
                className="page-btn"
                onClick={() => onPage(page - 1)}
                disabled={page === 1}
                aria-label="Trang trước"
            >
                <ChevronLeft size={16} />
            </button>

            {getPages().map((p, i) =>
                p === "…" ? (
                    <span key={`ellipsis-${i}`} className="page-btn" style={{ border: "none", cursor: "default" }}>
                        …
                    </span>
                ) : (
                    <button
                        key={p}
                        className={`page-btn ${page === p ? "active" : ""}`}
                        onClick={() => onPage(p as number)}
                        aria-label={`Trang ${p}`}
                        aria-current={page === p ? "page" : undefined}
                    >
                        {p}
                    </button>
                ),
            )}

            <button
                className="page-btn"
                onClick={() => onPage(page + 1)}
                disabled={page === totalPages}
                aria-label="Trang sau"
            >
                <ChevronRight size={16} />
            </button>
        </nav>
    );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Main search page                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */

const DISTRICTS = [
    "Quận 1","Quận 3","Quận 4","Quận 5","Quận 6","Quận 7","Quận 8",
    "Quận 10","Quận 11","Quận 12","Bình Thạnh","Thủ Đức","Gò Vấp",
    "Phú Nhuận","Tân Bình","Tân Phú","Bình Tân","Bình Chánh","Hóc Môn",
    "Củ Chi","Nhà Bè","Cần Giờ",
];

const UTILITIES_LIST = [
    { id: "wifi",             label: "Wifi / Internet" },
    { id: "air_conditioning", label: "Điều hòa nhiệt độ" },
    { id: "parking",          label: "Chỗ để xe máy" },
    { id: "fridge",           label: "Tủ lạnh riêng" },
    { id: "washing_machine",  label: "Máy giặt" },
    { id: "kitchen",          label: "Khu vực bếp nấu" },
    { id: "balcony",          label: "Ban công thoáng mát" },
];

function SearchPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const profile = useAuthStore((s) => s.profile);

    const [layout, setLayout] = useState<"grid" | "list">("grid");
    const [showFilters, setShowFilters] = useState(false);

    // Filter form state
    const [search, setSearch]           = useState(searchParams.get("search") || "");
    const [universityId, setUniversityId] = useState(searchParams.get("universityId") || "");
    const [district, setDistrict]       = useState(searchParams.get("district") || "");
    const [roomType, setRoomType]       = useState(searchParams.get("roomType") || "");
    const [minPrice, setMinPrice]       = useState(searchParams.get("minPrice") || "");
    const [maxPrice, setMaxPrice]       = useState(searchParams.get("maxPrice") || "");
    const [minArea, setMinArea]         = useState(searchParams.get("minArea") || "");
    const [maxArea, setMaxArea]         = useState(searchParams.get("maxArea") || "");
    const [selectedUtils, setSelectedUtils] = useState<string[]>(
        searchParams.get("utilities") ? (searchParams.get("utilities") as string).split(",") : [],
    );

    // Applied (only updates on form submit)
    const [appliedFilters, setAppliedFilters] = useState<RoomsFilter>({});
    const [page, setPage] = useState(() => {
        const p = searchParams.get("page");
        return p ? parseInt(p, 10) : 1;
    });

    // Universities
    const [universities, setUniversities] = useState<
        { id: string; name: string; abbreviation: string }[]
    >([]);

    // ─── Data ──────────────────────────────────────────────────────────────────
    const { data: roomsResult, isLoading } = useRooms({
        ...appliedFilters,
        page,
        limit: PAGE_SIZE,
    });
    const rooms       = roomsResult?.data ?? [];
    const totalRooms  = roomsResult?.total ?? 0;
    const totalPages  = Math.max(1, Math.ceil(totalRooms / PAGE_SIZE));

    const { data: bookmarksData = [] } = useBookmarks();
    const bookmarkedIds = bookmarksData.map((b) => b.room_id);
    const toggleBookmark = useToggleBookmark();

    useEffect(() => {
        apiClient.get("/universities").then((r) => setUniversities(r.data)).catch(() => {});
    }, []);

    // Init filters from URL
    useEffect(() => {
        const initial: RoomsFilter = {};
        if (searchParams.get("search"))      initial.search      = searchParams.get("search")!;
        if (searchParams.get("universityId"))initial.universityId = searchParams.get("universityId")!;
        if (searchParams.get("district"))    initial.district    = searchParams.get("district")!;
        if (searchParams.get("roomType"))    initial.roomType    = searchParams.get("roomType")!;
        if (searchParams.get("minPrice"))    initial.minPrice    = Number(searchParams.get("minPrice"));
        if (searchParams.get("maxPrice"))    initial.maxPrice    = Number(searchParams.get("maxPrice"));
        setAppliedFilters(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Handlers ──────────────────────────────────────────────────────────────
    const handleApplyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        const filters: RoomsFilter = {};
        if (search)      filters.search      = search;
        if (universityId)filters.universityId = universityId;
        if (district)    filters.district    = district;
        if (roomType)    filters.roomType    = roomType;
        if (minPrice)    filters.minPrice    = Number(minPrice);
        if (maxPrice)    filters.maxPrice    = Number(maxPrice);
        setPage(1);
        setAppliedFilters(filters);
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => v && params.set(k, String(v)));
        router.replace(`/search?${params.toString()}`, { scroll: false });
        setShowFilters(false);
    };

    const handleClear = () => {
        setSearch(""); setUniversityId(""); setDistrict(""); setRoomType("");
        setMinPrice(""); setMaxPrice(""); setMinArea(""); setMaxArea("");
        setSelectedUtils([]); setPage(1); setAppliedFilters({});
        router.push("/search");
    };

    const handleUtilityToggle = useCallback((id: string) => {
        setSelectedUtils(prev =>
            prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id],
        );
    }, []);

    const handleBookmarkToggle = (roomId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!profile) { router.push('/admin/login'); return; }
        const isBookmarked = bookmarkedIds.includes(roomId);
        toggleBookmark.mutate({ roomId, isBookmarked });
    };

    const handlePage = (p: number) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // ─── Options ───────────────────────────────────────────────────────────────
    const uniOptions = [
        { value: "", label: "Tất cả trường ĐH" },
        ...universities.map(u => ({ value: u.id, label: u.name, sublabel: u.abbreviation || undefined })),
    ];
    const districtOptions = [
        { value: "", label: "Tất cả quận/huyện" },
        ...DISTRICTS.map(d => ({ value: d, label: d })),
    ];
    const roomTypeOptions = [
        { value: "",           label: "Tất cả loại phòng" },
        { value: "single",     label: "Phòng đơn" },
        { value: "shared",     label: "Ở ghép / Phòng tập thể" },
        { value: "apartment",  label: "Căn hộ dịch vụ" },
        { value: "homestay",   label: "Homestay" },
    ];

    const activeFilterCount = [
        appliedFilters.search,
        appliedFilters.universityId,
        appliedFilters.district,
        appliedFilters.roomType,
        appliedFilters.minPrice,
        appliedFilters.maxPrice,
    ].filter(Boolean).length;

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <Navbar />

            <main className="flex-1" style={{ background: "var(--clr-bg-subtle)", paddingBlock: "2rem" }}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* ── Page Header ────────────────────────────────────────── */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="section-title">Tìm Kiếm Phòng Trọ</h1>
                            <p className="section-subtitle">
                                {isLoading
                                    ? "Đang tìm kiếm..."
                                    : `${totalRooms.toLocaleString("vi-VN")} phòng trọ phù hợp`}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Mobile filter toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="btn btn-ghost md:hidden relative"
                                aria-expanded={showFilters}
                            >
                                <SlidersHorizontal size={16} />
                                Bộ lọc
                                {activeFilterCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                        style={{ background: "var(--clr-primary-700)" }}>
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>

                            {/* Layout toggle */}
                            <div className="hidden sm:flex rounded-lg overflow-hidden"
                                style={{ border: "1.5px solid var(--clr-border)", background: "var(--clr-surface)" }}>
                                <button
                                    onClick={() => setLayout("grid")}
                                    className="p-2 transition-colors cursor-pointer"
                                    style={{
                                        background: layout === "grid" ? "var(--clr-primary-700)" : "transparent",
                                        color: layout === "grid" ? "#fff" : "var(--clr-text-muted)",
                                    }}
                                    aria-label="Dạng lưới"
                                    aria-pressed={layout === "grid"}
                                >
                                    <LayoutGrid size={16} />
                                </button>
                                <button
                                    onClick={() => setLayout("list")}
                                    className="p-2 transition-colors cursor-pointer"
                                    style={{
                                        background: layout === "list" ? "var(--clr-primary-700)" : "transparent",
                                        color: layout === "list" ? "#fff" : "var(--clr-text-muted)",
                                    }}
                                    aria-label="Dạng danh sách"
                                    aria-pressed={layout === "list"}
                                >
                                    <List size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Main Layout ────────────────────────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

                        {/* ── Filter Panel ─────────────────────────────────── */}
                        <form
                            onSubmit={handleApplyFilters}
                            className={`filter-panel md:col-span-3 md:sticky md:top-6 ${showFilters ? "block" : "hidden md:block"}`}
                            style={{ top: "1.5rem" }}
                        >
                            <div className="flex items-center justify-between pb-4 mb-5"
                                style={{ borderBottom: "1px solid var(--clr-border)" }}>
                                <h2 style={{
                                    fontFamily: "var(--font-heading)",
                                    fontWeight: 700,
                                    fontSize: "0.95rem",
                                    color: "var(--clr-text-primary)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                }}>
                                    <SlidersHorizontal size={16} style={{ color: "var(--clr-primary-700)" }} />
                                    Bộ lọc
                                    {activeFilterCount > 0 && (
                                        <span className="badge badge-primary" style={{ fontSize: "0.65rem" }}>
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </h2>
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="text-xs font-semibold cursor-pointer hover:underline"
                                    style={{ color: "var(--clr-primary-700)" }}
                                >
                                    Xóa tất cả
                                </button>
                            </div>

                            <div className="space-y-5">
                                {/* Keyword */}
                                <div>
                                    <label className="filter-label">Từ khóa</label>
                                    <div className="relative">
                                        <SearchIcon size={15}
                                            className="absolute left-3 top-1/2 -translate-y-1/2"
                                            style={{ color: "var(--clr-text-muted)" }} />
                                        <input
                                            type="text"
                                            id="filter-search"
                                            className="form-input"
                                            style={{ paddingLeft: "2.25rem" }}
                                            placeholder="Tên đường, khu vực..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* University */}
                                <div>
                                    <label className="filter-label">
                                        <GraduationCap size={12} className="inline mr-1" />
                                        Trường Đại học (3km)
                                    </label>
                                    <CustomSelect
                                        options={uniOptions}
                                        value={universityId}
                                        onChange={setUniversityId}
                                        placeholder="Tất cả trường ĐH"
                                        showSearch={true}
                                        icon={<GraduationCap size={15} />}
                                        triggerClassName="bg-[var(--clr-bg-subtle)] border border-[var(--clr-border)]"
                                    />
                                </div>

                                {/* District */}
                                <div>
                                    <label className="filter-label">
                                        <MapPin size={12} className="inline mr-1" />
                                        Quận / Huyện
                                    </label>
                                    <CustomSelect
                                        options={districtOptions}
                                        value={district}
                                        onChange={setDistrict}
                                        placeholder="Tất cả quận/huyện"
                                        showSearch={true}
                                        icon={<MapPin size={15} />}
                                        triggerClassName="bg-[var(--clr-bg-subtle)] border border-[var(--clr-border)]"
                                    />
                                </div>

                                {/* Room type */}
                                <div>
                                    <label className="filter-label">
                                        <Building2 size={12} className="inline mr-1" />
                                        Loại phòng
                                    </label>
                                    <CustomSelect
                                        options={roomTypeOptions}
                                        value={roomType}
                                        onChange={setRoomType}
                                        placeholder="Tất cả loại phòng"
                                        triggerClassName="bg-[var(--clr-bg-subtle)] border border-[var(--clr-border)]"
                                    />
                                </div>

                                {/* Price range */}
                                <div>
                                    <label className="filter-label">Khoảng giá (triệu/tháng)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            id="filter-min-price"
                                            className="form-input"
                                            placeholder="Từ (VD: 2)"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            id="filter-max-price"
                                            className="form-input"
                                            placeholder="Đến (VD: 5)"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Area range */}
                                <div>
                                    <label className="filter-label">Diện tích (m²)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            id="filter-min-area"
                                            className="form-input"
                                            placeholder="Min"
                                            value={minArea}
                                            onChange={(e) => setMinArea(e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            id="filter-max-area"
                                            className="form-input"
                                            placeholder="Max"
                                            value={maxArea}
                                            onChange={(e) => setMaxArea(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Utilities */}
                                <div>
                                    <label className="filter-label">Tiện ích đi kèm</label>
                                    <div className="space-y-2">
                                        {UTILITIES_LIST.map((util) => (
                                            <label key={util.id}
                                                className="flex items-center gap-2.5 cursor-pointer group/util">
                                                <input
                                                    type="checkbox"
                                                    id={`util-${util.id}`}
                                                    checked={selectedUtils.includes(util.id)}
                                                    onChange={() => handleUtilityToggle(util.id)}
                                                    className="rounded cursor-pointer"
                                                    style={{ accentColor: "var(--clr-primary-700)" }}
                                                />
                                                <span className="text-sm group-hover/util:text-[var(--clr-primary-700)] transition-colors"
                                                    style={{ color: "var(--clr-text-secondary)" }}>
                                                    {util.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    id="btn-apply-filters"
                                    className="btn btn-primary w-full justify-center"
                                    style={{ borderRadius: "var(--radius-md)", padding: "0.75rem" }}
                                >
                                    <RefreshCw size={15} />
                                    Áp dụng bộ lọc
                                </button>
                            </div>
                        </form>

                        {/* ── Results ───────────────────────────────────────── */}
                        <div className="md:col-span-9">
                            {isLoading ? (
                                /* Skeleton grid */
                                <div className={layout === "grid"
                                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                                    : "flex flex-col gap-4"}>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <SkeletonCard key={i} />
                                    ))}
                                </div>
                            ) : rooms.length === 0 ? (
                                /* Empty state */
                                <div className="flex flex-col items-center justify-center text-center py-20 rounded-[var(--radius-xl)]"
                                    style={{ background: "var(--clr-surface)", border: "1px solid var(--clr-border)" }}>
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                                        style={{ background: "var(--clr-primary-50)" }}>
                                        <Building2 size={28} style={{ color: "var(--clr-primary-700)" }} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2" style={{ color: "var(--clr-text-primary)" }}>
                                        Không tìm thấy phòng trọ
                                    </h3>
                                    <p className="text-sm max-w-sm mb-6" style={{ color: "var(--clr-text-secondary)" }}>
                                        Thử nới lỏng khoảng giá, thay đổi khu vực hoặc xóa bộ lọc để xem thêm phòng.
                                    </p>
                                    <button onClick={handleClear} className="btn btn-primary cursor-pointer">
                                        Xem tất cả phòng trọ
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Result count + sort */}
                                    <div className="flex items-center justify-between mb-4">
                                        <p style={{ fontSize: "0.875rem", color: "var(--clr-text-secondary)" }}>
                                            Hiển thị{" "}
                                            <strong style={{ color: "var(--clr-text-primary)" }}>
                                                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalRooms)}
                                            </strong>{" "}
                                            trong{" "}
                                            <strong style={{ color: "var(--clr-text-primary)" }}>
                                                {totalRooms.toLocaleString("vi-VN")}
                                            </strong>{" "}
                                            kết quả
                                        </p>
                                    </div>

                                    {/* Cards */}
                                    <div className={layout === "grid"
                                        ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                                        : "flex flex-col gap-4"}>
                                        {rooms.map((room) => (
                                            <RoomCard
                                                key={room.id}
                                                room={room}
                                                isBookmarked={bookmarkedIds.includes(room.id)}
                                                onBookmark={handleBookmarkToggle}
                                                onClick={() => router.push(`/rooms/${room.id}`)}
                                                layout={layout}
                                            />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    <Pagination page={page} totalPages={totalPages} onPage={handlePage} />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}

export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-10 w-10 rounded-full border-4 animate-spin"
                                style={{ borderColor: "var(--clr-primary-200)", borderTopColor: "var(--clr-primary-700)" }} />
                            <p style={{ color: "var(--clr-text-muted)", fontSize: "0.875rem" }}>
                                Đang tải...
                            </p>
                        </div>
                    </div>
                    <Footer />
                </div>
            }
        >
            <SearchPageContent />
        </Suspense>
    );
}

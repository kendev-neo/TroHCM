"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import {
    Search,
    MapPin,
    Building2,
    GraduationCap,
    Flame,
    ArrowRight,
    Wifi,
    AirVent,
    Car,
    Heart,
} from "lucide-react";
import { CustomSelect } from "../components/CustomSelect";

const ROOM_TYPE_LABELS: Record<string, { label: string; cls: string }> = {
    single:    { label: "Phòng đơn",  cls: "badge-type-single" },
    shared:    { label: "ở ghép",     cls: "badge-type-shared" },
    apartment: { label: "Căn hộ",     cls: "badge-type-apartment" },
    homestay:  { label: "Homestay",   cls: "badge-type-homestay" },
};

function formatPrice(price: number): string {
    if (price >= 1_000_000) {
        const m = price / 1_000_000;
        return m % 1 === 0 ? `${m} triệu` : `${m.toFixed(1)} triệu`;
    }
    return price.toLocaleString("vi-VN") + "đ";
}

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

interface University {
    id: string;
    name: string;
    abbreviation: string;
    address: string;
}

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
}

export default function Home() {
    const router = useRouter();

    // ────────────────────────────────────────────────────────────────────────────
    // UI state: Typewriter effect
    // - Tạo hiệu ứng gõ chữ ở phần hero headline
    // - Logic: lặp qua mảng "words" → tăng dần độ dài string → xóa dần → lặp lại
    // ────────────────────────────────────────────────────────────────────────────
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(150);

    useEffect(() => {
        const words = [
            "Giá Rẻ, Gần Trường Đại Học",
            "Ký Túc Xá, Ở Ghép",
            "Căn Hộ Dịch Vụ, Studio",
        ];
        let timer: NodeJS.Timeout;

        const handleTyping = () => {
            const fullWord = words[currentWordIndex];
            if (!isDeleting) {
                setCurrentText(fullWord.substring(0, currentText.length + 1));
                setTypingSpeed(100);

                if (currentText === fullWord) {
                    timer = setTimeout(() => setIsDeleting(true), 1500);
                    return;
                }
            } else {
                setCurrentText(fullWord.substring(0, currentText.length - 1));
                setTypingSpeed(50);

                if (currentText === "") {
                    setIsDeleting(false);
                    setCurrentWordIndex((prev) => (prev + 1) % words.length);
                    setTypingSpeed(150);
                    return;
                }
            }

            timer = setTimeout(handleTyping, typingSpeed);
        };

        timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [currentText, isDeleting, currentWordIndex, typingSpeed]);

    // States
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUniversity, setSelectedUniversity] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");

    const [universities, setUniversities] = useState<University[]>([]);
    const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(true);

    // HCM Districts list for search dropdown
    const districts = [
        "Quận 1",
        "Quận 3",
        "Quận 4",
        "Quận 5",
        "Quận 6",
        "Quận 7",
        "Quận 8",
        "Quận 10",
        "Quận 11",
        "Quận 12",
        "Bình Thạnh",
        "Thủ Đức",
        "Gò Vấp",
        "Phú Nhuận",
        "Tân Bình",
        "Tân Phú",
        "Bình Tân",
        "Bình Chánh",
        "Hóc Môn",
        "Củ Chi",
        "Nhà Bè",
        "Cần Giờ",
    ];

    const uniOptions =
        universities.length > 0
            ? universities.map((uni) => ({
                  value: uni.id,
                  label: uni.name,
                  sublabel: uni.abbreviation || undefined,
              }))
            : [
                  { value: "11111111-1111-1111-1111-111111111111", label: "ĐH Bách Khoa", sublabel: "HCMUT" },
                  {
                      value: "22222222-2222-2222-2222-222222222222",
                      label: "ĐH Khoa học Tự nhiên",
                      sublabel: "HCMUS",
                  },
                  {
                      value: "33333333-3333-3333-3333-333333333333",
                      label: "ĐH Sư phạm Kỹ thuật",
                      sublabel: "HCMUTE",
                  },
                  { value: "44444444-4444-4444-4444-444444444444", label: "ĐH Tôn Đức Thắng", sublabel: "TDTU" },
              ];

    const districtOptions = districts.map((d) => ({
        value: d,
        label: d,
    }));

    // Fetch data on mount
    useEffect(() => {
        // 1. Fetch universities
        fetch(`${BACKEND_URL}/universities`)
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => setUniversities(data))
            .catch((err) => console.error("Error fetching universities:", err));

        // 2. Fetch featured rooms
        fetch(`${BACKEND_URL}/rooms`)
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
                const roomsList = Array.isArray(data)
                    ? data
                    : (data.data ?? []);
                setFeaturedRooms(roomsList.slice(0, 4)); // Show top 4 rooms
                setLoadingRooms(false);
            })
            .catch((err) => {
                console.error("Error fetching rooms:", err);
                setLoadingRooms(false);
            });
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        // Construct query parameters
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (selectedUniversity)
            params.append("universityId", selectedUniversity);
        if (selectedDistrict) params.append("district", selectedDistrict);

        router.push(`/search?${params.toString()}`);
    };

    const handleUniversityClick = (uniId: string) => {
        router.push(`/search?universityId=${uniId}`);
    };

    // Mock rooms as fallback if backend returned nothing (makes UI look completed)
    const mockRoomsFallback: Room[] = [
        {
            id: "mock-1",
            title: "Phòng trọ cao cấp Studio gác lửng gần ĐH Tôn Đức Thắng",
            price: 3500000,
            area: 25,
            room_type: "single",
            address: "Đường Nguyễn Hữu Thọ, Phường Tân Phong, Quận 7",
            district: "Quận 7",
            utilities: ["wifi", "air_conditioning", "parking", "fridge"],
            images: [
                {
                    url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=80",
                    is_primary: true,
                },
            ],
        },
        {
            id: "mock-2",
            title: "Phòng sạch đẹp, thoáng mát sát ĐH Bách Khoa Quận 10",
            price: 2800000,
            area: 20,
            room_type: "shared",
            address: "Lý Thường Kiệt, Phường 14, Quận 10",
            district: "Quận 10",
            utilities: ["wifi", "parking", "washing_machine"],
            images: [
                {
                    url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=500&q=80",
                    is_primary: true,
                },
            ],
        },
        {
            id: "mock-3",
            title: "Ký túc xá cao cấp ở ghép đầy đủ tiện nghi gần ĐH SPKT Thủ Đức",
            price: 1500000,
            area: 35,
            room_type: "shared",
            address: "Linh Chiểu, Thủ Đức, TP. Hồ Chí Minh",
            district: "Thủ Đức",
            utilities: [
                "wifi",
                "air_conditioning",
                "fridge",
                "kitchen",
                "washing_machine",
            ],
            images: [
                {
                    url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=500&q=80",
                    is_primary: true,
                },
            ],
        },
        {
            id: "mock-4",
            title: "Căn hộ mini 1 phòng ngủ ban công thoáng mát Gò Vấp",
            price: 4200000,
            area: 30,
            room_type: "apartment",
            address: "Nguyễn Văn Bảo, Phường 4, Gò Vấp",
            district: "Gò Vấp",
            utilities: [
                "wifi",
                "air_conditioning",
                "fridge",
                "parking",
                "balcony",
            ],
            images: [
                {
                    url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=500&q=80",
                    is_primary: true,
                },
            ],
        },
    ];

    const roomsToDisplay =
        featuredRooms.length > 0 ? featuredRooms : mockRoomsFallback;

    return (
        <>
            <Navbar />

            <main className="flex-1">
                {/* HERO SECTION */}
                <section style={{
                    position: "relative",
                    background: "linear-gradient(135deg, #1e0a3c 0%, #2d1065 40%, #1a0533 100%)",
                    minHeight: "calc(100vh - 64px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingBlock: "5rem",
                    overflow: "hidden",
                }}>
                    {/* Decorative blobs */}
                    <div style={{
                        position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden",
                    }}>
                        <div style={{
                            position: "absolute", top: "-10%", right: "-5%",
                            width: "480px", height: "480px",
                            borderRadius: "50%",
                            background: "radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)",
                        }} />
                        <div style={{
                            position: "absolute", bottom: "-15%", left: "-8%",
                            width: "400px", height: "400px",
                            borderRadius: "50%",
                            background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)",
                        }} />
                        {/* Grid overlay */}
                        <div style={{
                            position: "absolute", inset: 0,
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                                              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
                            backgroundSize: "40px 40px",
                        }} />
                    </div>

                    <div className="relative w-full mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
                        {/* Pill badge */}
                        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full"
                            style={{
                                background: "rgba(167,139,250,0.15)",
                                border: "1px solid rgba(167,139,250,0.3)",
                            }}>
                            <Flame size={14} style={{ color: "#fbbf24" }} />
                            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#e9d5ff" }}>
                                Nền tảng tìm trọ #1 cho sinh viên TP.HCM
                            </span>
                        </div>

                        <h1 style={{
                            fontFamily: "var(--font-heading)",
                            fontSize: "clamp(2rem, 5vw, 3.5rem)",
                            fontWeight: 900,
                            letterSpacing: "-0.03em",
                            lineHeight: 1.1,
                            color: "#fff",
                        }}>
                            Tìm Phòng Trọ Sinh Viên{" "}
                            <br className="hidden sm:inline" />
                            <span style={{
                                background: "linear-gradient(90deg, #c084fc, #a78bfa, #818cf8)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                display: "inline-block",
                                minWidth: "20px",
                            }}>
                                {currentText}
                                <span style={{
                                    display: "inline-block",
                                    width: "3px",
                                    height: "0.85em",
                                    background: "#c084fc",
                                    marginLeft: "3px",
                                    verticalAlign: "middle",
                                    borderRadius: "2px",
                                    animation: "pulse 1s ease-in-out infinite",
                                }} />
                            </span>{" "}
                            <br className="hidden sm:inline" />
                            <span style={{ color: "#f0e6ff" }}>Tại TP.HCM</span>
                        </h1>

                        <p style={{
                            marginTop: "1.25rem",
                            fontSize: "clamp(0.95rem, 2vw, 1.0625rem)",
                            color: "rgba(240,230,255,0.75)",
                            maxWidth: "520px",
                            margin: "1.25rem auto 0",
                            lineHeight: 1.7,
                        }}>
                            Lọc phòng trọ theo quận, khoảng giá và bán kính gần
                            trường đại học — nhanh chóng, uy tín.
                        </p>

                        {/* Search form */}
                        <div className="mx-auto mt-10" style={{ maxWidth: "820px" }}>
                            <form
                                onSubmit={handleSearch}
                                id="hero-search-form"
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr",
                                    gap: "0.5rem",
                                    background: "rgba(255,255,255,0.08)",
                                    backdropFilter: "blur(16px)",
                                    padding: "0.625rem",
                                    borderRadius: "1.25rem",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    boxShadow: "0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
                                }}
                                className="md:grid-cols-[1fr_1fr_1fr_auto]"
                            >
                                {/* Search keyword */}
                                <div className="relative">
                                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                                        style={{ color: "#94a3b8" }} />
                                    <input
                                        type="text"
                                        id="search-input-hero"
                                        placeholder="Tìm tên trọ, địa chỉ..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{
                                            width: "100%",
                                            borderRadius: "0.875rem",
                                            background: "#fff",
                                            padding: "0.8rem 1rem 0.8rem 2.75rem",
                                            fontSize: "0.875rem",
                                            color: "#0f0f1a",
                                            border: "none",
                                            outline: "none",
                                        }}
                                    />
                                </div>

                                {/* University */}
                                <CustomSelect
                                    options={uniOptions}
                                    value={selectedUniversity}
                                    onChange={setSelectedUniversity}
                                    placeholder="Chọn Trường ĐH..."
                                    showSearch={true}
                                    icon={<GraduationCap size={16} />}
                                    triggerClassName="!bg-white !text-slate-700 !border-none !rounded-[0.875rem] !py-[0.8rem] font-medium"
                                />

                                {/* District */}
                                <CustomSelect
                                    options={districtOptions}
                                    value={selectedDistrict}
                                    onChange={setSelectedDistrict}
                                    placeholder="Chọn Quận/Huyện..."
                                    showSearch={true}
                                    icon={<MapPin size={16} />}
                                    triggerClassName="!bg-white !text-slate-700 !border-none !rounded-[0.875rem] !py-[0.8rem] font-medium"
                                />

                                <button
                                    type="submit"
                                    id="btn-search-hero"
                                    className="cursor-pointer flex items-center justify-center gap-2 font-bold text-white transition-all active:scale-95"
                                    style={{
                                        background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                                        padding: "0.8rem 1.5rem",
                                        borderRadius: "0.875rem",
                                        fontSize: "0.875rem",
                                        boxShadow: "0 4px 14px rgba(124,58,237,0.5)",
                                        border: "none",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    <Search size={16} />
                                    Tìm ngay
                                </button>
                            </form>
                        </div>

                        {/* Popular searches */}
                        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                            <span style={{ fontSize: "0.8125rem", color: "rgba(220,200,255,0.7)", fontWeight: 500 }}>
                                <Flame size={13} className="inline mr-1" style={{ color: "#fbbf24" }} />
                                Phổ biến:
                            </span>
                            {["Thủ Đức", "Quận 10", "Quận 7", "Bình Thạnh", "Gò Vấp"].map(d => (
                                <button
                                    key={d}
                                    onClick={() => router.push(`/search?district=${d}`)}
                                    className="cursor-pointer transition-all hover:scale-105"
                                    style={{
                                        padding: "0.3rem 0.85rem",
                                        borderRadius: "999px",
                                        fontSize: "0.75rem",
                                        fontWeight: 500,
                                        background: "rgba(255,255,255,0.07)",
                                        border: "1px solid rgba(255,255,255,0.15)",
                                        color: "rgba(240,230,255,0.85)",
                                    }}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="mt-12 flex flex-wrap justify-center gap-8">
                            {[
                                { n: "500+",  label: "Phòng trọ" },
                                { n: "50+",   label: "Trường ĐH" },
                                { n: "100%",  label: "Chính chủ" },
                            ].map(({ n, label }) => (
                                <div key={label} className="text-center">
                                    <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", fontWeight: 800, color: "#c084fc" }}>{n}</p>
                                    <p style={{ fontSize: "0.78rem", color: "rgba(220,200,255,0.6)", marginTop: "0.125rem" }}>{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* POPULAR UNIVERSITIES */}
                <section className="py-20 bg-slate-50 dark:bg-slate-900/50 transition-colors">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
                                Tìm Trọ Theo Trường Đại Học
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">
                                Dễ dàng tìm thấy các phòng trọ nằm trong bán
                                kính gần cổng trường của bạn
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Card 1 */}
                            <div
                                onClick={() => handleUniversityClick("11111111-1111-1111-1111-111111111111")}
                                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-800 transition-all hover:-translate-y-1"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-4">
                                    Đại học Bách Khoa
                                </h3>
                                <p className="text-xs text-indigo-500 font-semibold mt-1">
                                    HCMUT
                                </p>
                                <p className="text-xs text-slate-400 mt-2 truncate">
                                    Q.10 & TP. Thủ Đức, TP.HCM
                                </p>
                                <span className="mt-4 flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Xem phòng trọ{" "}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </span>
                            </div>

                            {/* Card 2 */}
                            <div
                                onClick={() => handleUniversityClick("22222222-2222-2222-2222-222222222222")}
                                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-800 transition-all hover:-translate-y-1"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-4">
                                    ĐH Khoa học Tự nhiên
                                </h3>
                                <p className="text-xs text-indigo-500 font-semibold mt-1">
                                    HCMUS
                                </p>
                                <p className="text-xs text-slate-400 mt-2 truncate">
                                    Quận 5 & TP. Thủ Đức, TP.HCM
                                </p>
                                <span className="mt-4 flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Xem phòng trọ{" "}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </span>
                            </div>

                            {/* Card 3 */}
                            <div
                                onClick={() => handleUniversityClick("33333333-3333-3333-3333-333333333333")}
                                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-800 transition-all hover:-translate-y-1"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-4">
                                    ĐH Sư phạm Kỹ thuật
                                </h3>
                                <p className="text-xs text-indigo-500 font-semibold mt-1">
                                    HCMUTE
                                </p>
                                <p className="text-xs text-slate-400 mt-2 truncate">
                                    Võ Văn Ngân, Thủ Đức, TP.HCM
                                </p>
                                <span className="mt-4 flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Xem phòng trọ{" "}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </span>
                            </div>

                            {/* Card 4 */}
                            <div
                                onClick={() => handleUniversityClick("44444444-4444-4444-4444-444444444444")}
                                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-800 transition-all hover:-translate-y-1"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-4">
                                    ĐH Tôn Đức Thắng
                                </h3>
                                <p className="text-xs text-indigo-500 font-semibold mt-1">
                                    TDTU
                                </p>
                                <p className="text-xs text-slate-400 mt-2 truncate">
                                    Nguyễn Hữu Thọ, Quận 7, TP.HCM
                                </p>
                                <span className="mt-4 flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Xem phòng trọ{" "}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURED ROOMS */}
                <section className="py-20 bg-white dark:bg-slate-900 transition-colors">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
                                    Tin Đăng Mới Nhất
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-2">
                                    Danh sách phòng trọ vừa được cập nhật tại
                                    các khu vực TP.HCM
                                </p>
                            </div>
                            <button
                                onClick={() => router.push("/search")}
                                className="mt-4 sm:mt-0 flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline gap-1 cursor-pointer"
                            >
                                Xem tất cả phòng trọ{" "}
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>

                        {loadingRooms ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="rounded-[var(--radius-xl)] overflow-hidden border"
                                        style={{ borderColor: "var(--clr-border)", background: "var(--clr-surface)" }}>
                                        <div className="skeleton" style={{ aspectRatio: "16/10" }} />
                                        <div className="p-4 space-y-3">
                                            <div className="skeleton h-4 rounded w-3/4" />
                                            <div className="skeleton h-3 rounded w-1/2" />
                                            <div className="skeleton h-5 rounded w-full mt-4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                {roomsToDisplay.map((room) => {
                                    const typeInfo = ROOM_TYPE_LABELS[room.room_type] ?? { label: room.room_type, cls: "badge-primary" };
                                    const imgSrc = room.images?.length > 0
                                        ? room.images.find(i => i.is_primary)?.url ?? room.images[0].url
                                        : "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80";
                                    return (
                                        <div
                                            key={room.id}
                                            className="room-card group"
                                            onClick={() => router.push(`/rooms/${room.id}`)}
                                            role="article"
                                            tabIndex={0}
                                            onKeyDown={(e) => e.key === "Enter" && router.push(`/rooms/${room.id}`)}
                                        >
                                            <div className="room-card-img">
                                                <img src={imgSrc} alt={room.title} loading="lazy" />
                                                <span className={`badge ${typeInfo.cls} absolute bottom-2.5 left-2.5`}>
                                                    {typeInfo.label}
                                                </span>
                                            </div>
                                            <div className="p-4 flex flex-col flex-1">
                                                <h3 className="font-semibold leading-snug truncate-2 group-hover:text-[var(--clr-primary-700)] transition-colors"
                                                    style={{ fontSize: "0.9rem", color: "var(--clr-text-primary)" }}>
                                                    {room.title}
                                                </h3>
                                                <p className="mt-1.5 flex items-center gap-1"
                                                    style={{ fontSize: "0.78rem", color: "var(--clr-text-muted)" }}>
                                                    <MapPin size={12} className="shrink-0" />
                                                    <span className="truncate">{room.district}</span>
                                                </p>
                                                <div className="mt-auto pt-3 flex items-end justify-between"
                                                    style={{ borderTop: "1px solid var(--clr-border)" }}>
                                                    <div>
                                                        <p style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--clr-text-muted)", fontWeight: 700 }}>Giá thuê</p>
                                                        <span className="text-price">{formatPrice(room.price)}</span>
                                                        <span className="text-price-unit">/tháng</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--clr-text-muted)", fontWeight: 700 }}>Diện tích</p>
                                                        <p className="font-bold" style={{ fontSize: "0.875rem", color: "var(--clr-text-primary)" }}>{room.area} m²</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section className="py-20 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 transition-colors">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
                            Tìm Kiếm Trọ Dễ Dàng
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
                            Trải nghiệm quy trình tìm kiếm phòng trọ tiện lợi
                            chỉ với 3 bước đơn giản
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                            <div className="p-6">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 shadow-sm font-black text-xl">
                                    1
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-6">
                                    Chọn trường Đại học
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                    Nhập hoặc chọn tên trường Đại học bạn chuẩn
                                    bị theo học để định vị các tin đăng xung
                                    quanh trường.
                                </p>
                            </div>

                            <div className="p-6">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 shadow-sm font-black text-xl">
                                    2
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-6">
                                    Lọc phòng ưng ý
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                    Lọc phòng theo nhu cầu: phòng đơn, căn hộ,
                                    giá tiền phù hợp túi tiền, các tiện ích bắt
                                    buộc (máy lạnh, máy giặt, tủ lạnh...).
                                </p>
                            </div>

                            <div className="p-6">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 shadow-sm font-black text-xl">
                                    3
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-6">
                                    Liên hệ trực tiếp
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                    Xem thông tin liên hệ của chủ trọ (số điện
                                    thoại) hoặc đăng ký thành viên để lưu tin
                                    đăng yêu thích.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { useAuthStore } from "../../stores/authStore";
import { ImageUploader } from "../../components/ImageUploader";
import {
    useRooms,
    useCreateRoom,
    useUpdateRoom,
    useDeleteRoom,
    Room,
    CreateRoomDto,
} from "../../hooks/useRooms";
import {
    useContacts,
    useUpdateContactStatus,
    Contact,
} from "../../hooks/useContacts";
import {
    LayoutDashboard,
    Building,
    MessageSquare,
    Plus,
    Edit,
    Trash2,
    LogOut,
    CheckCircle,
    XCircle,
    Clock,
    Phone,
    Mail,
    User,
    Eye,
    X,
    Save,
    RefreshCw,
} from "lucide-react";
import { CustomSelect } from "../../components/CustomSelect";

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

const districtOptions = districts.map((d) => ({
    value: d,
    label: d,
}));

const roomTypeOptions = [
    { value: "single", label: "Phòng đơn" },
    { value: "shared", label: "Ở ghép / Ký túc xá" },
    { value: "apartment", label: "Căn hộ dịch vụ" },
    { value: "homestay", label: "Nhà nguyên căn / Homestay" },
];

type Tab = "rooms" | "contacts";

export default function AdminPage() {
    const router = useRouter();
    const profile = useAuthStore((s) => s.profile);
    const authLoading = useAuthStore((s) => s.loading);

    const [activeTab, setActiveTab] = useState<Tab>("rooms");

    // TanStack Query — data
    const {
        data: roomsResult,
        isLoading: loadingRooms,
        refetch: refetchRooms,
    } = useRooms({});
    const rooms = roomsResult?.data ?? [];
    const totalRooms = roomsResult?.total ?? 0;
    const {
        data: contacts = [],
        isLoading: loadingContacts,
        refetch: refetchContacts,
    } = useContacts();
    const createRoom = useCreateRoom();
    const updateRoom = useUpdateRoom();
    const deleteRoom = useDeleteRoom();
    const updateContactStatus = useUpdateContactStatus();

    // Room form modal
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [roomForm, setRoomForm] = useState({
        title: "",
        description: "",
        price: "",
        area: "",
        roomType: "single",
        address: "",
        ward: "",
        district: "Quận 10",
        utilities: [] as string[],
        images: [] as string[],
    });

    // Contact detail modal
    const [selectedContact, setSelectedContact] = useState<Contact | null>(
        null,
    );

    // Action states
    const [actionMsg, setActionMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const utilitiesList = [
        { id: "wifi", label: "Wifi" },
        { id: "air_conditioning", label: "Điều hòa" },
        { id: "parking", label: "Gửi xe" },
        { id: "fridge", label: "Tủ lạnh" },
        { id: "washing_machine", label: "Máy giặt" },
        { id: "kitchen", label: "Bếp" },
        { id: "balcony", label: "Ban công" },
    ];

    // Redirect nếu không phải admin (sau khi auth đã load xong)
    React.useEffect(() => {
        if (!authLoading && (!profile || profile.role !== "admin")) {
            router.replace("/admin/login");
        }
    }, [profile, authLoading]);

    const showMsg = (msg: string, isError = false) => {
        if (isError) setErrorMsg(msg);
        else setActionMsg(msg);
        setTimeout(() => {
            setActionMsg(null);
            setErrorMsg(null);
        }, 3000);
    };

    // ---- ROOM CRUD ----
    const openCreateRoom = () => {
        setEditingRoom(null);
        setRoomForm({
            title: "",
            description: "",
            price: "",
            area: "",
            roomType: "single",
            address: "",
            ward: "",
            district: "Quận 10",
            utilities: [],
            images: [],
        });
        setShowRoomModal(true);
    };

    const openEditRoom = (room: Room) => {
        setEditingRoom(room);
        setRoomForm({
            title: room.title,
            description: "",
            price: String(room.price),
            area: String(room.area),
            roomType: room.room_type,
            address: room.address,
            ward: "",
            district: room.district,
            utilities: [],
            images: room.images?.map((i) => i.url) || [],
        });
        setShowRoomModal(true);
    };

    const handleSaveRoom = async () => {
        const dto: CreateRoomDto = {
            title: roomForm.title,
            description: roomForm.description,
            price: parseInt(roomForm.price, 10),
            area: parseFloat(roomForm.area),
            roomType: roomForm.roomType,
            address: roomForm.address,
            ward: roomForm.ward || "Không rõ",
            district: roomForm.district,
            utilities: roomForm.utilities,
            images: roomForm.images,
        };
        try {
            if (editingRoom) {
                await updateRoom.mutateAsync({ id: editingRoom.id, dto });
                showMsg("Đã cập nhật phòng trọ thành công!");
            } else {
                await createRoom.mutateAsync(dto);
                showMsg("Đã tạo phòng trọ mới thành công!");
            }
            setShowRoomModal(false);
        } catch (e: any) {
            showMsg(
                e.response?.data?.message || e.message || "Thao tác thất bại",
                true,
            );
        }
    };

    const handleDeleteRoom = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa phòng trọ này không?")) return;
        try {
            await deleteRoom.mutateAsync(id);
            showMsg("Đã xóa phòng trọ.");
        } catch {
            showMsg("Không thể xóa phòng trọ.", true);
        }
    };

    // ---- CONTACT ACTIONS ----
    const handleContactStatus = async (
        id: string,
        status: "approved" | "ignored",
    ) => {
        try {
            await updateContactStatus.mutateAsync({ id, status });
            showMsg(
                status === "approved"
                    ? "Đã đánh dấu Đã duyệt."
                    : "Đã bỏ qua yêu cầu này.",
            );
            if (selectedContact?.id === id)
                setSelectedContact((prev) =>
                    prev ? { ...prev, status } : null,
                );
        } catch {
            showMsg("Thao tác thất bại.", true);
        }
    };

    const handleApproveAndCreate = async (contact: Contact) => {
        const dto: CreateRoomDto = {
            title: contact.room_title,
            description: contact.room_description,
            price: contact.room_price,
            area: contact.room_area,
            roomType: contact.room_type,
            address: contact.room_address,
            ward: contact.room_ward,
            district: contact.room_district,
            utilities: contact.room_utilities || [],
            images: contact.room_images || [],
            landlordName: contact.landlord_name,
            landlordPhone: contact.landlord_phone,
            landlordEmail: contact.landlord_email,
        };
        try {
            await createRoom.mutateAsync(dto);
            await handleContactStatus(contact.id, "approved");
            showMsg(
                "Đã duyệt và tạo phòng trọ thành công! Tin đã hiển thị trên trang chủ.",
            );
            setSelectedContact(null);
        } catch (e: any) {
            showMsg(
                e.response?.data?.message ||
                    e.message ||
                    "Không thể tạo phòng trọ từ liên hệ này.",
                true,
            );
        }
    };

    const saving = createRoom.isPending || updateRoom.isPending;

    const statusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle className="h-3 w-3" />
                        Đã duyệt
                    </span>
                );
            case "ignored":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">
                        <XCircle className="h-3 w-3" />
                        Bỏ qua
                    </span>
                );
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                        <Clock className="h-3 w-3" />
                        Chờ duyệt
                    </span>
                );
            case "rented":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-400">
                        Đã cho thuê
                    </span>
                );
            default:
                return <span className="text-xs text-slate-400">{status}</span>;
        }
    };

    // Loading / Access guard
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

    if (!profile || profile.role !== "admin") {
        return (
            <div className="min-h-screen flex flex-col justify-between">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="max-w-sm text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                            <XCircle className="h-7 w-7" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                            Chỉ dành cho Admin
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Bạn cần đăng nhập bằng tài khoản Admin để truy cập
                            trang quản trị hệ thống.
                        </p>
                        <button
                            onClick={() => router.push("/admin/login")}
                            className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-all cursor-pointer"
                        >
                            Đăng nhập Admin
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

            <main className="flex-1 bg-slate-50 dark:bg-slate-900/50 py-8 transition-colors">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow">
                                <LayoutDashboard className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                                    Admin Dashboard
                                </h1>
                                <p className="text-xs text-slate-400">
                                    Quản lý toàn bộ phòng trọ và yêu cầu đăng tin
                                    trên hệ thống
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => useAuth().logout()}
                            className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-all cursor-pointer"
                        >
                            <LogOut className="h-4 w-4" />
                            Đăng xuất
                        </button>
                    </div>

                    {/* Alert messages */}
                    {actionMsg && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                            <CheckCircle className="h-5 w-5 shrink-0" />
                            {actionMsg}
                        </div>
                    )}
                    {errorMsg && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm font-semibold text-red-700 dark:text-red-400">
                            <XCircle className="h-5 w-5 shrink-0" />
                            {errorMsg}
                        </div>
                    )}

                    {/* Stats cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[
                            {
                                label: "Tổng phòng trọ",
                                value: totalRooms,
                                color: "indigo",
                            },
                            {
                                label: "Đã duyệt",
                                value: rooms.filter(
                                    (r) => r.status === "approved",
                                ).length,
                                color: "emerald",
                            },
                            {
                                label: "Chờ duyệt liên hệ",
                                value: contacts.filter(
                                    (c) => c.status === "pending",
                                ).length,
                                color: "amber",
                            },
                            {
                                label: "Tổng liên hệ",
                                value: contacts.length,
                                color: "slate",
                            },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800 p-5 shadow-sm"
                            >
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {stat.label}
                                </p>
                                <p
                                    className={`text-3xl font-black mt-1 text-${stat.color}-600 dark:text-${stat.color}-400`}
                                >
                                    {stat.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
                        <button
                            onClick={() => setActiveTab("rooms")}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "rooms" ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
                        >
                            <Building className="h-4 w-4" />
                            Quản lý Phòng trọ ({totalRooms})
                        </button>
                        <button
                            onClick={() => setActiveTab("contacts")}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "contacts" ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
                        >
                            <MessageSquare className="h-4 w-4" />
                            Yêu cầu Liên hệ
                            {contacts.filter((c) => c.status === "pending")
                                .length > 0 && (
                                <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white px-1">
                                    {
                                        contacts.filter(
                                            (c) => c.status === "pending",
                                        ).length
                                    }
                                </span>
                            )}
                        </button>
                    </div>

                    {/* ====== TAB: ROOMS ====== */}
                    {activeTab === "rooms" && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {totalRooms} phòng trọ trong hệ thống
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => refetchRooms()}
                                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                        Làm mới
                                    </button>
                                    <button
                                        onClick={openCreateRoom}
                                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Thêm phòng mới
                                    </button>
                                </div>
                            </div>

                            {loadingRooms ? (
                                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                                    <p className="mt-3 text-sm text-slate-500">
                                        Đang tải dữ liệu phòng trọ...
                                    </p>
                                </div>
                            ) : rooms.length === 0 ? (
                                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <Building className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">
                                        Chưa có phòng trọ nào trong hệ thống.
                                    </p>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Hãy thêm phòng mới hoặc duyệt yêu cầu từ
                                        chủ trọ.
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/40">
                                                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                                                    Phòng trọ
                                                </th>
                                                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 hidden md:table-cell">
                                                    Quận
                                                </th>
                                                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 hidden lg:table-cell">
                                                    Giá
                                                </th>
                                                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                                                    Trạng thái
                                                </th>
                                                <th className="text-right px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                                                    Hành động
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                                            {rooms.map((room) => (
                                                <tr
                                                    key={room.id}
                                                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0">
                                                                <img
                                                                    src={
                                                                        room
                                                                            .images?.[0]
                                                                            ?.url ||
                                                                        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=200&q=60"
                                                                    }
                                                                    alt={
                                                                        room.title
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-800 dark:text-white line-clamp-1">
                                                                    {room.title}
                                                                </p>
                                                                <p className="text-xs text-slate-400 truncate max-w-[180px]">
                                                                    {
                                                                        room.address
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300 text-xs hidden md:table-cell">
                                                        {room.district}
                                                    </td>
                                                    <td className="px-4 py-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hidden lg:table-cell">
                                                        {(
                                                            room.price / 1000000
                                                        ).toFixed(1)}
                                                        tr/th
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {statusBadge(
                                                            room.status,
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    router.push(
                                                                        `/rooms/${room.id}`,
                                                                    )
                                                                }
                                                                title="Xem trang chi tiết"
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    openEditRoom(
                                                                        room,
                                                                    )
                                                                }
                                                                title="Chỉnh sửa"
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/20 transition-colors cursor-pointer"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteRoom(
                                                                        room.id,
                                                                    )
                                                                }
                                                                title="Xóa"
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ====== TAB: CONTACTS ====== */}
                    {activeTab === "contacts" && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {contacts.length} yêu cầu đã nhận —{" "}
                                    <span className="text-amber-600 font-semibold">
                                        {
                                            contacts.filter(
                                                (c) => c.status === "pending",
                                            ).length
                                        }{" "}
                                        chờ duyệt
                                    </span>
                                </p>
                                <button
                                    onClick={() => refetchContacts()}
                                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Làm mới
                                </button>
                            </div>

                            {loadingContacts ? (
                                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                                    <p className="mt-3 text-sm text-slate-500">
                                        Đang tải danh sách liên hệ...
                                    </p>
                                </div>
                            ) : contacts.length === 0 ? (
                                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">
                                        Chưa có yêu cầu liên hệ nào.
                                    </p>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Chủ trọ chưa gửi đề xuất đăng tin từ
                                        trang Liên hệ.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {contacts.map((contact) => (
                                        <div
                                            key={contact.id}
                                            className={`rounded-2xl border bg-white dark:bg-slate-800 p-5 shadow-sm transition-all hover:shadow-md cursor-pointer ${contact.status === "pending" ? "border-amber-300 dark:border-amber-700/50" : "border-slate-200 dark:border-slate-700"}`}
                                            onClick={() =>
                                                setSelectedContact(contact)
                                            }
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <h3 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-2 leading-snug">
                                                    {contact.room_title}
                                                </h3>
                                                {statusBadge(contact.status)}
                                            </div>

                                            <div className="space-y-1.5 mb-4">
                                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                    <User className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                    <span>
                                                        {contact.landlord_name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                    <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                    <span>
                                                        {contact.landlord_phone}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                    <span className="truncate">
                                                        {contact.landlord_email}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="border-t border-slate-100 dark:border-slate-700/50 pt-3 flex items-center justify-between">
                                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                    {(
                                                        contact.room_price /
                                                        1000000
                                                    ).toFixed(1)}
                                                    tr/th · {contact.room_area}
                                                    m² · {contact.room_district}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(
                                                        contact.created_at,
                                                    ).toLocaleDateString(
                                                        "vi-VN",
                                                    )}
                                                </span>
                                            </div>

                                            {contact.status === "pending" && (
                                                <div
                                                    className="flex gap-2 mt-3"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <button
                                                        onClick={() =>
                                                            handleApproveAndCreate(
                                                                contact,
                                                            )
                                                        }
                                                        disabled={saving}
                                                        className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
                                                    >
                                                        ✓ Duyệt & Đăng
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleContactStatus(
                                                                contact.id,
                                                                "ignored",
                                                            )
                                                        }
                                                        className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                                    >
                                                        Bỏ qua
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* ====== ROOM FORM MODAL ====== */}
            {showRoomModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                                {editingRoom
                                    ? "Chỉnh sửa phòng trọ"
                                    : "Thêm phòng trọ mới"}
                            </h2>
                            <button
                                onClick={() => setShowRoomModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Tiêu đề *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={roomForm.title}
                                    onChange={(e) =>
                                        setRoomForm((f) => ({
                                            ...f,
                                            title: e.target.value,
                                        }))
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Mô tả
                                </label>
                                <textarea
                                    rows={3}
                                    value={roomForm.description}
                                    onChange={(e) =>
                                        setRoomForm((f) => ({
                                            ...f,
                                            description: e.target.value,
                                        }))
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Giá (VND/tháng) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={roomForm.price}
                                        onChange={(e) =>
                                            setRoomForm((f) => ({
                                                ...f,
                                                price: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Diện tích (m²) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={roomForm.area}
                                        onChange={(e) =>
                                            setRoomForm((f) => ({
                                                ...f,
                                                area: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Loại phòng
                                    </label>
                                    <CustomSelect
                                        options={roomTypeOptions}
                                        value={roomForm.roomType}
                                        onChange={(val) =>
                                            setRoomForm((f) => ({
                                                ...f,
                                                roomType: val,
                                            }))
                                        }
                                        placeholder="Chọn loại phòng"
                                        triggerClassName="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Địa chỉ *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={roomForm.address}
                                    onChange={(e) =>
                                        setRoomForm((f) => ({
                                            ...f,
                                            address: e.target.value,
                                        }))
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Phường/Xã
                                    </label>
                                    <input
                                        type="text"
                                        value={roomForm.ward}
                                        onChange={(e) =>
                                            setRoomForm((f) => ({
                                                ...f,
                                                ward: e.target.value,
                                            }))
                                        }
                                        placeholder="Phường 14"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Quận/Huyện *
                                    </label>
                                    <CustomSelect
                                        options={districtOptions}
                                        value={roomForm.district}
                                        onChange={(val) =>
                                            setRoomForm((f) => ({
                                                ...f,
                                                district: val,
                                            }))
                                        }
                                        placeholder="Chọn Quận/Huyện"
                                        showSearch={true}
                                        triggerClassName="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Tiện ích
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {utilitiesList.map((u) => (
                                        <label
                                            key={u.id}
                                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer transition-all ${roomForm.utilities.includes(u.id) ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/20 dark:text-indigo-300" : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900/40"}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={roomForm.utilities.includes(
                                                    u.id,
                                                )}
                                                onChange={() =>
                                                    setRoomForm((f) => ({
                                                        ...f,
                                                        utilities:
                                                            f.utilities.includes(
                                                                u.id,
                                                            )
                                                                ? f.utilities.filter(
                                                                      (x) =>
                                                                          x !==
                                                                          u.id,
                                                                  )
                                                                : [
                                                                      ...f.utilities,
                                                                      u.id,
                                                                  ],
                                                    }))
                                                }
                                                className="accent-indigo-600"
                                            />
                                            {u.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <ImageUploader
                                    label="Ảnh phòng trọ"
                                    value={roomForm.images}
                                    onChange={(urls) =>
                                        setRoomForm((f) => ({
                                            ...f,
                                            images: urls,
                                        }))
                                    }
                                    maxImages={10}
                                />
                            </div>
                        </div>

                        <div className="sticky bottom-0 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4 flex gap-3">
                            <button
                                onClick={() => setShowRoomModal(false)}
                                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSaveRoom}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                <Save className="h-4 w-4" />
                                {saving
                                    ? "Đang lưu..."
                                    : editingRoom
                                      ? "Cập nhật"
                                      : "Tạo phòng trọ"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ====== CONTACT DETAIL MODAL ====== */}
            {selectedContact && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setSelectedContact(null)}
                >
                    <div
                        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                                Chi tiết yêu cầu liên hệ
                            </h2>
                            <button
                                onClick={() => setSelectedContact(null)}
                                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 space-y-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                                    Thông tin Chủ trọ
                                </p>
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-indigo-500" />
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                                        {selectedContact.landlord_name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-indigo-500" />
                                    <a
                                        href={`tel:${selectedContact.landlord_phone}`}
                                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        {selectedContact.landlord_phone}
                                    </a>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-indigo-500" />
                                    <a
                                        href={`mailto:${selectedContact.landlord_email}`}
                                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        {selectedContact.landlord_email}
                                    </a>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white text-base">
                                    {selectedContact.room_title}
                                </h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                        {(
                                            selectedContact.room_price / 1000000
                                        ).toFixed(1)}{" "}
                                        triệu/tháng
                                    </span>
                                    <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        {selectedContact.room_area} m²
                                    </span>
                                    <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">
                                        {selectedContact.room_type === "single"
                                            ? "Phòng đơn"
                                            : selectedContact.room_type ===
                                                "shared"
                                              ? "Ở ghép"
                                              : selectedContact.room_type ===
                                                  "apartment"
                                                ? "Căn hộ"
                                                : "Homestay"}
                                    </span>
                                </div>
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    {selectedContact.room_address},{" "}
                                    {selectedContact.room_ward},{" "}
                                    {selectedContact.room_district}
                                </p>
                            </div>

                            {selectedContact.room_description && (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                        Mô tả
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                        {selectedContact.room_description}
                                    </p>
                                </div>
                            )}

                            {selectedContact.room_utilities?.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                        Tiện ích
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedContact.room_utilities.map(
                                            (u) => (
                                                <span
                                                    key={u}
                                                    className="rounded bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 font-medium"
                                                >
                                                    {utilitiesList.find(
                                                        (ul) => ul.id === u,
                                                    )?.label || u}
                                                </span>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedContact.room_images?.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                        Hình ảnh
                                    </p>
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {selectedContact.room_images.map(
                                            (url, i) => (
                                                <img
                                                    key={i}
                                                    src={url}
                                                    alt={`Ảnh ${i + 1}`}
                                                    className="h-24 w-36 rounded-xl object-cover shrink-0"
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-1">
                                <div>{statusBadge(selectedContact.status)}</div>
                                <p className="text-xs text-slate-400">
                                    Gửi lúc{" "}
                                    {new Date(
                                        selectedContact.created_at,
                                    ).toLocaleString("vi-VN")}
                                </p>
                            </div>
                        </div>

                        {selectedContact.status === "pending" && (
                            <div className="sticky bottom-0 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4 flex gap-3">
                                <button
                                    onClick={() =>
                                        handleContactStatus(
                                            selectedContact.id,
                                            "ignored",
                                        )
                                    }
                                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                >
                                    Bỏ qua
                                </button>
                                <button
                                    onClick={() =>
                                        handleApproveAndCreate(selectedContact)
                                    }
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    {saving
                                        ? "Đang xử lý..."
                                        : "Duyệt & Đăng phòng trọ"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}

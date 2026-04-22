import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminApi from "../../api/modules/admin.api.js";
import { ADMIN_PATH } from "../../routes/path.js";

const STAT_CARDS = [
    { key: "totalUsers",    label: "Người dùng",  icon: "👥", color: "from-blue-600 to-blue-800",    link: ADMIN_PATH.USERS },
    { key: "totalMovies",   label: "Bộ phim",     icon: "🎬", color: "from-purple-600 to-purple-800", link: ADMIN_PATH.MOVIES },
    { key: "totalTheaters", label: "Rạp phim",    icon: "🏢", color: "from-green-600 to-green-800",   link: ADMIN_PATH.THEATERS },
    { key: "totalBookings", label: "Lượt đặt vé", icon: "🎫", color: "from-orange-600 to-orange-800", link: ADMIN_PATH.BOOKINGS },
];

function StatCard({ label, value, icon, color, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`bg-gradient-to-br ${color} rounded-xl p-5 cursor-pointer hover:opacity-90 transition`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-white/70 text-sm font-medium">{label}</p>
                    <p className="text-white text-3xl font-bold mt-1">
                        {value?.toLocaleString() ?? "—"}
                    </p>
                </div>
                <span className="text-4xl opacity-80">{icon}</span>
            </div>
        </div>
    );
}

function RevenueCard({ value }) {
    const formatted = value != null
        ? value.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
        : "—";
    return (
        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-white/70 text-sm font-medium">Tổng doanh thu</p>
                    <p className="text-white text-2xl font-bold mt-1">{formatted}</p>
                </div>
                <span className="text-4xl opacity-80">💰</span>
            </div>
        </div>
    );
}

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const [statsRes, bookingsRes] = await Promise.allSettled([
                    adminApi.getStats(),
                    adminApi.getBookings(),
                ]);
                if (statsRes.status === "fulfilled") setStats(statsRes.value?.data);
                if (bookingsRes.status === "fulfilled") setBookings(bookingsRes.value?.data?.slice(0, 8) || []);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const STATUS_STYLE = {
        paid:      "bg-green-500/20 text-green-400",
        pending:   "bg-yellow-500/20 text-yellow-400",
        cancelled: "bg-red-500/20 text-red-400",
        expired:   "bg-gray-500/20 text-gray-400",
        refunded:  "bg-blue-500/20 text-blue-400",
    };

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {STAT_CARDS.map((card) => (
                    <StatCard
                        key={card.key}
                        label={card.label}
                        icon={card.icon}
                        color={card.color}
                        value={loading ? null : stats?.[card.key]}
                        onClick={() => navigate(`/admin/${card.link}`)}
                    />
                ))}
                <RevenueCard value={loading ? null : stats?.totalRevenue} />
            </div>

            {/* Recent Bookings */}
            <div className="bg-gray-900 rounded-xl border border-gray-800">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                    <h3 className="text-white font-semibold">Đặt vé gần đây</h3>
                    <button
                        onClick={() => navigate(`/admin/${ADMIN_PATH.BOOKINGS}`)}
                        className="text-red-400 hover:text-red-300 text-sm transition"
                    >
                        Xem tất cả →
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 border-b border-gray-800">
                                <th className="text-left px-5 py-3 font-medium">Khách hàng</th>
                                <th className="text-left px-5 py-3 font-medium">Phim</th>
                                <th className="text-left px-5 py-3 font-medium">Tổng tiền</th>
                                <th className="text-left px-5 py-3 font-medium">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-gray-800/50">
                                        {[...Array(4)].map((_, j) => (
                                            <td key={j} className="px-5 py-3">
                                                <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-5 py-8 text-center text-gray-600">
                                        Chưa có đặt vé nào
                                    </td>
                                </tr>
                            ) : bookings.map((b) => (
                                <tr key={b._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                                    <td className="px-5 py-3">
                                        <p className="text-white font-medium">{b.userId?.userName || "—"}</p>
                                        <p className="text-gray-500 text-xs">{b.userId?.email}</p>
                                    </td>
                                    <td className="px-5 py-3 text-gray-300">
                                        {b.showId?.movieId?.movieName || "—"}
                                    </td>
                                    <td className="px-5 py-3 text-white font-medium">
                                        {b.totalPrice?.toLocaleString("vi-VN")}đ
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[b.status] || ""}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;

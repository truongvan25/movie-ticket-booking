import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import managerApi from "../../api/modules/manager.api.js";

const STATUS_LABEL = {
    paid:      { label: "Đã thanh toán", cls: "bg-green-500/20 text-green-400" },
    pending:   { label: "Chờ xử lý",     cls: "bg-yellow-500/20 text-yellow-400" },
    cancelled: { label: "Đã hủy",        cls: "bg-red-500/20 text-red-400" },
    expired:   { label: "Hết hạn",       cls: "bg-gray-500/20 text-gray-400" },
    refunded:  { label: "Hoàn tiền",     cls: "bg-blue-500/20 text-blue-400" },
};

const STAT_CARDS = [
    { key: "totalTheaters", label: "Rạp của tôi",  icon: "🏢", color: "from-blue-600 to-blue-800" },
    { key: "totalMovies",   label: "Bộ phim",       icon: "🎬", color: "from-purple-600 to-purple-800" },
    { key: "totalRooms",    label: "Phòng chiếu",   icon: "🪑", color: "from-green-600 to-green-800" },
    { key: "totalShows",    label: "Lịch chiếu",    icon: "📅", color: "from-orange-600 to-orange-800" },
    { key: "totalRevenue",  label: "Doanh thu rạp", icon: "💰", color: "from-red-600 to-red-800", currency: true },
];

function ManagerDashboard() {
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([
            managerApi.getStats(),
            managerApi.getBookings(),
        ]).then(([s, b]) => {
            if (s.status === "fulfilled") setStats(s.value?.data);
            if (b.status === "fulfilled") setBookings((b.value?.data || []).slice(0, 5));
        }).finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-white font-bold text-lg">Dashboard</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {STAT_CARDS.map((card) => (
                    <div key={card.key} className={`bg-gradient-to-br ${card.color} rounded-xl p-4`}>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-white/70 text-xs">{card.label}</p>
                            <span className="text-xl">{card.icon}</span>
                        </div>
                        <p className="text-white text-2xl font-bold">
                            {loading ? "—" : card.currency
                                ? `${(stats?.[card.key] || 0).toLocaleString("vi-VN")}đ`
                                : (stats?.[card.key] ?? 0)}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Đặt vé gần đây</h3>
                    <Link to="/manager/bookings" className="text-red-400 text-sm hover:text-red-300">
                        Xem tất cả →
                    </Link>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-500 border-b border-gray-800">
                            <th className="text-left py-2 font-medium">Khách hàng</th>
                            <th className="text-left py-2 font-medium">Phim</th>
                            <th className="text-left py-2 font-medium">Tổng tiền</th>
                            <th className="text-left py-2 font-medium">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(4)].map((_, i) => (
                                <tr key={i} className="border-b border-gray-800/50">
                                    {[...Array(4)].map((_, j) => (
                                        <td key={j} className="py-3 pr-4">
                                            <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : bookings.length === 0 ? (
                            <tr><td colSpan={4} className="py-8 text-center text-gray-600">Chưa có đặt vé nào</td></tr>
                        ) : bookings.map((b) => (
                            <tr key={b._id} className="border-b border-gray-800/50">
                                <td className="py-3 pr-4">
                                    <p className="text-white font-medium">{b.userId?.userName || "—"}</p>
                                    <p className="text-gray-500 text-xs">{b.userId?.email}</p>
                                </td>
                                <td className="py-3 pr-4 text-gray-300">{b.showId?.movieId?.movieName || "—"}</td>
                                <td className="py-3 pr-4 text-white font-medium">{b.totalPrice?.toLocaleString("vi-VN")}đ</td>
                                <td className="py-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        (STATUS_LABEL[b.status] || STATUS_LABEL.expired).cls
                                    }`}>
                                        {(STATUS_LABEL[b.status] || { label: b.status }).label}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ManagerDashboard;

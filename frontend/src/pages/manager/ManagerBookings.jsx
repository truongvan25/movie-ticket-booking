import React, { useEffect, useState } from "react";
import managerApi from "../../api/modules/manager.api.js";

const STATUS_OPTIONS = [
    { value: "", label: "Tất cả" },
    { value: "paid", label: "Đã thanh toán" },
    { value: "pending", label: "Chờ xử lý" },
    { value: "cancelled", label: "Đã hủy" },
    { value: "expired", label: "Hết hạn" },
    { value: "refunded", label: "Hoàn tiền" },
];
const STATUS_STYLE = {
    paid: "bg-green-500/20 text-green-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    cancelled: "bg-red-500/20 text-red-400",
    expired: "bg-gray-500/20 text-gray-400",
    refunded: "bg-blue-500/20 text-blue-400",
};

function ManagerBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        setLoading(true);
        managerApi.getBookings(statusFilter)
            .then((res) => setBookings(res?.data || []))
            .finally(() => setLoading(false));
    }, [statusFilter]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Quản lý đặt vé</h2>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500">
                    {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 border-b border-gray-800">
                                <th className="text-left px-4 py-3 font-medium">Khách hàng</th>
                                <th className="text-left px-4 py-3 font-medium">Phim</th>
                                <th className="text-left px-4 py-3 font-medium">Tổng tiền</th>
                                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                                <th className="text-left px-4 py-3 font-medium">Ngày đặt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? [...Array(5)].map((_, i) => (
                                <tr key={i} className="border-b border-gray-800/50">
                                    {[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" /></td>)}
                                </tr>
                            )) : bookings.length === 0 ? (
                                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-600">Không có đặt vé nào</td></tr>
                            ) : bookings.map((b) => (
                                <tr key={b._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                                    <td className="px-4 py-3">
                                        <p className="text-white font-medium">{b.userId?.userName || "—"}</p>
                                        <p className="text-gray-500 text-xs">{b.userId?.email}</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-300">{b.showId?.movieId?.movieName || "—"}</td>
                                    <td className="px-4 py-3 text-white font-medium">{b.totalPrice?.toLocaleString("vi-VN")}đ</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[b.status] || ""}`}>
                                            {STATUS_OPTIONS.find((o) => o.value === b.status)?.label || b.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(b.createdAt).toLocaleString("vi-VN")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-gray-800 text-gray-500 text-xs">{bookings.length} giao dịch</div>
            </div>
        </div>
    );
}

export default ManagerBookings;

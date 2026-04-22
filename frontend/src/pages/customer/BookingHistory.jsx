import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import customerApi from "../../api/modules/customer.api.js";
import { PATH } from "../../routes/path.js";

const STATUS_STYLE = {
    paid:      "bg-green-500/20 text-green-400",
    pending:   "bg-yellow-500/20 text-yellow-400",
    cancelled: "bg-red-500/20 text-red-400",
    expired:   "bg-gray-500/20 text-gray-400",
    refunded:  "bg-blue-500/20 text-blue-400",
};
const STATUS_LABEL = {
    paid:      "Đã thanh toán",
    pending:   "Chờ thanh toán",
    cancelled: "Đã hủy",
    expired:   "Hết hạn",
    refunded:  "Đã hoàn tiền",
};
const SEAT_LABEL = { standard: "Thường", vip: "VIP", couple: "Cặp đôi" };

function BookingCard({ booking, onCancel }) {
    const [expanded, setExpanded] = useState(false);
    const show = booking.showId;
    const movie = show?.movieId;
    const theater = show?.theaterId;
    const room = show?.roomId;
    const canCancel = booking.status === "paid" && show?.startTime && new Date(show.startTime) > new Date();
    const [cancelling, setCancelling] = useState(false);

    const handleCancel = async (e) => {
        e.stopPropagation();
        if (!window.confirm("Bạn có chắc muốn hủy đơn đặt vé này?")) return;
        setCancelling(true);
        try {
            await onCancel(booking._id);
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <button
                className="w-full p-5 text-left hover:bg-gray-800/40 transition"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start gap-4">
                    {movie?.poster
                        ? <img src={movie.poster} alt={movie.movieName} className="w-12 h-16 object-cover rounded-lg shrink-0" />
                        : <div className="w-12 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-xl shrink-0">🎬</div>
                    }
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-white font-semibold text-sm">{movie?.movieName || "—"}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_STYLE[booking.status] || ""}`}>
                                {STATUS_LABEL[booking.status] || booking.status}
                            </span>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">{theater?.theaterName}</p>
                        {show?.startTime && (
                            <p className="text-gray-500 text-xs">
                                {new Date(show.startTime).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })}
                            </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-red-400 font-bold text-sm">
                                {booking.totalPrice?.toLocaleString("vi-VN")}đ
                                <span className="text-gray-600 font-normal ml-1 text-xs">
                                    ({(booking.tickets || []).length} vé)
                                </span>
                            </p>
                            <span className="text-gray-600 text-xs">
                                {expanded ? "▲ Ẩn bớt" : "▼ Chi tiết"}
                            </span>
                        </div>
                    </div>
                </div>
            </button>

            {/* Expanded detail */}
            {expanded && (
                <div className="border-t border-gray-800 px-5 pb-5 pt-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                        <div className="text-gray-500">Mã đơn</div>
                        <div className="text-white font-mono text-xs">{booking._id?.slice(-10).toUpperCase()}</div>
                        <div className="text-gray-500">Phòng chiếu</div>
                        <div className="text-white">{room?.roomNumber || "—"}</div>
                        <div className="text-gray-500">Ngày đặt</div>
                        <div className="text-white">{new Date(booking.createdAt).toLocaleDateString("vi-VN")}</div>
                    </div>

                    {(booking.tickets || []).length > 0 && (
                        <div className="space-y-2 mb-4">
                            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Danh sách ghế</p>
                            {booking.tickets.map((t) => (
                                <div key={t._id} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium">{t.seatId?.seatNumber || "—"}</span>
                                        <span className="text-gray-500 text-xs">
                                            {SEAT_LABEL[t.seatId?.seatType] || t.seatId?.seatType}
                                        </span>
                                    </div>
                                    <span className="text-gray-300">{t.price?.toLocaleString("vi-VN")}đ</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {canCancel && (
                        <button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="w-full border border-red-500/40 text-red-400 hover:bg-red-500/10 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50"
                        >
                            {cancelling ? "Đang hủy..." : "Hủy đơn này"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default function BookingHistory() {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((s) => s.auth);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (!isAuthenticated) { navigate(`/auth/${PATH.SIGNIN}`); return; }
        customerApi.getMyBookings()
            .then((r) => setBookings(r?.data || []))
            .finally(() => setLoading(false));
    }, [isAuthenticated]);

    const handleCancel = async (bookingId) => {
        await customerApi.cancelBooking(bookingId);
        setBookings((prev) => prev.map((b) =>
            b._id === bookingId ? { ...b, status: "cancelled" } : b
        ));
    };

    const filtered = bookings.filter((b) => {
        if (filter === "paid") return b.status === "paid";
        if (filter === "cancelled") return b.status === "cancelled";
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <h1 className="text-2xl font-bold">Lịch sử đặt vé</h1>
                    <div className="flex gap-2">
                        <button onClick={() => navigate(`/${PATH.MY_TICKETS}`)}
                            className="text-gray-400 hover:text-white text-sm transition border border-gray-700 px-3 py-1.5 rounded-lg">
                            🎫 Vé của tôi
                        </button>
                        <button onClick={() => navigate(PATH.HOME)}
                            className="text-gray-400 hover:text-white text-sm transition">
                            ← Trang chủ
                        </button>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex gap-2 mb-5 flex-wrap">
                    {[
                        { key: "all",       label: "Tất cả" },
                        { key: "paid",      label: "Đã thanh toán" },
                        { key: "cancelled", label: "Đã hủy" },
                    ].map(({ key, label }) => (
                        <button key={key} onClick={() => setFilter(key)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                                filter === key ? "bg-red-500 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-gray-900 rounded-2xl h-28 animate-pulse border border-gray-800" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4">📋</div>
                        <p className="text-gray-500 mb-4">Chưa có lịch sử đặt vé</p>
                        <button onClick={() => navigate(PATH.HOME)}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">
                            Đặt vé ngay
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((b) => (
                            <BookingCard key={b._id} booking={b} onCancel={handleCancel} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

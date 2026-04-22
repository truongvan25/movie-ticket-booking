import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import customerApi from "../../api/modules/customer.api.js";
import { PATH } from "../../routes/path.js";

const SEAT_LABEL = { standard: "Thường", vip: "VIP", couple: "Cặp đôi" };
const SEAT_COLOR = {
    standard: "bg-gray-700 text-gray-300",
    vip: "bg-indigo-800 text-indigo-200",
    couple: "bg-pink-800 text-pink-200",
};
const STATUS_STYLE = {
    paid: "bg-green-500/20 text-green-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    cancelled: "bg-red-500/20 text-red-400",
    expired: "bg-gray-500/20 text-gray-400",
};
const STATUS_LABEL = {
    paid: "Đã thanh toán",
    pending: "Chờ thanh toán",
    cancelled: "Đã hủy",
    expired: "Hết hạn",
};

function TicketCard({ ticket }) {
    const show = ticket.showId;
    const movie = show?.movieId;
    const theater = show?.theaterId;
    const room = show?.roomId;
    const seat = ticket.seatId;
    const booking = ticket.bookingId;
    const isPast = show?.startTime && new Date(show.startTime) < new Date();

    return (
        <div className={`bg-gray-900 border rounded-2xl overflow-hidden transition ${
            booking?.status === "cancelled" ? "border-gray-800 opacity-60" : "border-gray-800 hover:border-gray-700"
        }`}>
            <div className="flex">
                {/* Poster strip */}
                <div className="w-20 shrink-0">
                    {movie?.poster
                        ? <img src={movie.poster} alt={movie.movieName} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gray-800 flex items-center justify-center text-2xl min-h-[120px]">🎬</div>
                    }
                </div>
                {/* Main content */}
                <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-white font-semibold text-sm leading-tight">{movie?.movieName || "—"}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                            STATUS_STYLE[booking?.status] || STATUS_STYLE.paid
                        }`}>
                            {STATUS_LABEL[booking?.status] || "—"}
                        </span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-400">
                        <p>📍 {theater?.theaterName || "—"} · {room?.roomNumber || "—"}</p>
                        {show?.startTime && (
                            <p>🕐 {new Date(show.startTime).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${SEAT_COLOR[seat?.seatType] || "bg-gray-700 text-gray-300"}`}>
                                {seat?.seatNumber} — {SEAT_LABEL[seat?.seatType] || seat?.seatType}
                            </span>
                            <span className="text-white font-medium">{ticket.price?.toLocaleString("vi-VN")}đ</span>
                        </div>
                    </div>
                </div>
                {/* Ticket code side */}
                <div className="w-16 bg-gray-800 border-l border-dashed border-gray-700 flex flex-col items-center justify-center p-2 gap-2">
                    {/* Simple barcode visual */}
                    <div className="flex gap-0.5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className={`w-0.5 bg-gray-400 opacity-80`}
                                style={{ height: `${12 + ((ticket._id?.charCodeAt(i) || 60) % 12)}px` }} />
                        ))}
                    </div>
                    <p className="text-gray-500 text-[9px] font-mono text-center leading-tight break-all">
                        {ticket._id?.slice(-6).toUpperCase()}
                    </p>
                    {isPast && <span className="text-gray-600 text-[9px]">Đã dùng</span>}
                </div>
            </div>
        </div>
    );
}

export default function MyTickets() {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((s) => s.auth);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all | upcoming | past | cancelled

    useEffect(() => {
        if (!isAuthenticated) { navigate(`/auth/${PATH.SIGNIN}`); return; }
        customerApi.getMyTickets()
            .then((r) => setTickets(r?.data || []))
            .finally(() => setLoading(false));
    }, [isAuthenticated]);

    const filtered = tickets.filter((t) => {
        const show = t.showId;
        const isPast = show?.startTime && new Date(show.startTime) < new Date();
        const isCancelled = t.bookingId?.status === "cancelled";
        if (filter === "upcoming") return !isPast && !isCancelled;
        if (filter === "past") return isPast && !isCancelled;
        if (filter === "cancelled") return isCancelled;
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <h1 className="text-2xl font-bold">Vé của tôi</h1>
                    <button onClick={() => navigate(PATH.HOME)}
                        className="text-gray-400 hover:text-white text-sm transition">
                        ← Trang chủ
                    </button>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-5 flex-wrap">
                    {[
                        { key: "all",       label: "Tất cả" },
                        { key: "upcoming",  label: "Sắp chiếu" },
                        { key: "past",      label: "Đã chiếu" },
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
                        <div className="text-5xl mb-4">🎫</div>
                        <p className="text-gray-500 mb-4">Chưa có vé nào</p>
                        <button onClick={() => navigate(PATH.HOME)}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">
                            Đặt vé ngay
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((t) => <TicketCard key={t._id} ticket={t} />)}
                    </div>
                )}
            </div>
        </div>
    );
}

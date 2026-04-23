import React, { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import movieApi from "../../api/modules/movie.api.js";
import customerApi from "../../api/modules/customer.api.js";
import { PATH } from "../../routes/path.js";

const SEAT_COLORS = {
    booked:    "bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed",
    selected:  "bg-red-500 border-red-400 text-white",
    vip:       "bg-indigo-900/60 border-indigo-500/50 text-indigo-300 hover:border-indigo-400",
    couple:    "bg-pink-900/60 border-pink-500/50 text-pink-300 hover:border-pink-400",
    standard:  "bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-400",
};

const PRICE_MULT = { standard: 1, vip: 1.5, couple: 2 };
const TYPE_LABEL = { standard: "Thường", vip: "VIP", couple: "Cặp đôi" };

function parseSeatRow(seatNumber) {
    const m = String(seatNumber).match(/^([A-Z]+)/i);
    return m ? m[1].toUpperCase() : "A";
}
function parseSeatCol(seatNumber) {
    const m = String(seatNumber).match(/(\d+)$/);
    return m ? parseInt(m[1]) : 0;
}

function SeatMap({ seats, selected, onToggle }) {
    const rows = useMemo(() => {
        const map = {};
        seats.forEach((s) => {
            const row = parseSeatRow(s.seatNumber);
            if (!map[row]) map[row] = [];
            map[row].push(s);
        });
        Object.values(map).forEach((arr) => arr.sort((a, b) => parseSeatCol(a.seatNumber) - parseSeatCol(b.seatNumber)));
        return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
    }, [seats]);

    return (
        <div className="space-y-2">
            {/* Screen */}
            <div className="flex justify-center mb-4">
                <div className="w-3/4 max-w-md">
                    <div className="h-2 bg-gradient-to-r from-transparent via-gray-400 to-transparent rounded-full opacity-50" />
                    <p className="text-center text-gray-500 text-xs mt-1">MÀN HÌNH</p>
                </div>
            </div>
            {rows.map(([rowLabel, rowSeats]) => (
                <div key={rowLabel} className="flex items-center gap-1.5 justify-center flex-wrap">
                    <span className="text-gray-600 text-xs w-5 text-right shrink-0">{rowLabel}</span>
                    <div className="flex gap-1 flex-wrap justify-center">
                        {rowSeats.map((seat) => {
                            const isSelected = selected.has(seat._id);
                            const color = seat.isBooked
                                ? SEAT_COLORS.booked
                                : isSelected
                                ? SEAT_COLORS.selected
                                : SEAT_COLORS[seat.seatType] || SEAT_COLORS.standard;

                            return (
                                <button
                                    key={seat._id}
                                    disabled={seat.isBooked}
                                    onClick={() => !seat.isBooked && onToggle(seat)}
                                    className={`w-8 h-8 text-xs rounded border font-medium transition ${color}`}
                                    title={`${seat.seatNumber} – ${TYPE_LABEL[seat.seatType]}`}
                                >
                                    {seat.seatNumber.replace(/^[A-Z]+/i, "")}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-gray-800 text-xs text-gray-400">
                {[
                    { label: "Thường",   cls: "bg-gray-800 border-gray-600" },
                    { label: "VIP",      cls: "bg-indigo-900/60 border-indigo-500/50" },
                    { label: "Cặp đôi", cls: "bg-pink-900/60 border-pink-500/50" },
                    { label: "Đã đặt",  cls: "bg-gray-700 border-gray-600" },
                    { label: "Đang chọn", cls: "bg-red-500 border-red-400" },
                ].map(({ label, cls }) => (
                    <span key={label} className="flex items-center gap-1.5">
                        <span className={`w-4 h-4 rounded border ${cls} inline-block`} />
                        {label}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function Booking() {
    const { movieId } = useParams();
    const [searchParams] = useSearchParams();
    const preselectedShowId = searchParams.get("showId");
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((s) => s.auth);

    const [step, setStep] = useState(preselectedShowId ? 2 : 1);
    const [movie, setMovie] = useState(null);
    const [shows, setShows] = useState([]);
    const [selectedShow, setSelectedShow] = useState(null);
    const [seats, setSeats] = useState([]);
    const [selected, setSelected] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [seatsLoading, setSeatsLoading] = useState(false);
    const [booking, setBooking] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [promoInput, setPromoInput] = useState("");
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [promoApplied, setPromoApplied] = useState(null);
    const [promoError, setPromoError] = useState("");
    const [promoLoading, setPromoLoading] = useState(false);

    useEffect(() => {
        if (!movieId) return;
        Promise.all([
            movieApi.getById(movieId),
            customerApi.getShows({ movieId }),
        ]).then(([mv, sv]) => {
            setMovie(mv?.data || mv);
            const allShows = sv?.data || [];
            setShows(allShows);
            if (preselectedShowId) {
                const found = allShows.find((s) => s._id === preselectedShowId);
                if (found) {
                    setSelectedShow(found);
                } else {
                    customerApi.getShowById(preselectedShowId).then((r) => setSelectedShow(r?.data || r));
                }
            }
        }).finally(() => setLoading(false));
    }, [movieId]);

    useEffect(() => {
        if (!selectedShow) return;
        setSeatsLoading(true);
        setSelected(new Set());
        customerApi.getShowSeats(selectedShow._id)
            .then((r) => setSeats(r?.data || []))
            .finally(() => setSeatsLoading(false));
    }, [selectedShow]);

    const filteredShows = useMemo(() => {
        if (!selectedDate) return shows.filter((s) => new Date(s.endTime) > new Date());
        const start = new Date(selectedDate); start.setHours(0, 0, 0, 0);
        const end = new Date(selectedDate); end.setHours(23, 59, 59, 999);
        return shows.filter((s) => {
            const t = new Date(s.startTime);
            return t >= start && t <= end;
        });
    }, [shows, selectedDate]);

    const showsByTheater = filteredShows.reduce((acc, s) => {
        const tid = String(s.theaterId?._id || s.theaterId);
        if (!acc[tid]) acc[tid] = { theater: s.theaterId, shows: [] };
        acc[tid].shows.push(s);
        return acc;
    }, {});

    const toggleSeat = (seat) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(seat._id)) next.delete(seat._id);
            else next.add(seat._id);
            return next;
        });
        // Reset promo when seat selection changes
        setPromoApplied(null);
        setPromoDiscount(0);
        setPromoInput("");
        setPromoError("");
    };

    const selectedSeats = seats.filter((s) => selected.has(s._id));
    const totalPrice = selectedSeats.reduce(
        (sum, s) => sum + Math.round((selectedShow?.price || 0) * (PRICE_MULT[s.seatType] || 1)), 0
    );

    const applyPromo = async () => {
        if (!promoInput.trim()) return;
        setPromoError("");
        setPromoLoading(true);
        try {
            const res = await customerApi.validatePromo({ code: promoInput.trim(), totalPrice });
            setPromoDiscount(res?.data?.discount || 0);
            setPromoApplied(promoInput.trim().toUpperCase());
        } catch (e) {
            setPromoError(e?.message || "Mã không hợp lệ");
            setPromoDiscount(0);
            setPromoApplied(null);
        } finally {
            setPromoLoading(false);
        }
    };

    const finalPrice = Math.max(0, totalPrice - promoDiscount);

    const handleBook = async () => {
        if (!isAuthenticated) {
            navigate(`/auth/${PATH.SIGNIN}`);
            return;
        }
        if (!selectedShow || selected.size === 0) return;
        setBooking(true);
        setError("");
        try {
            const res = await customerApi.createBooking({
                showId: selectedShow._id,
                seatIds: [...selected],
                promoCode: promoApplied || undefined,
            });
            setSuccess(res?.data?.booking || res?.data);
        } catch (e) {
            setError(e?.message || "Đặt vé thất bại! Vui lòng thử lại.");
        } finally {
            setBooking(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-gray-500 animate-pulse">Đang tải...</div>
        </div>
    );

    if (success) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-green-500/30 rounded-2xl p-8 max-w-sm w-full text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-white text-xl font-bold mb-2">Đặt vé thành công!</h2>
                <p className="text-gray-400 text-sm mb-1">
                    Phim: <span className="text-white font-medium">{movie?.movieName}</span>
                </p>
                <p className="text-gray-400 text-sm mb-1">
                    Rạp: <span className="text-white">{selectedShow?.theaterId?.theaterName}</span>
                </p>
                <p className="text-gray-400 text-sm mb-4">
                    Giờ: <span className="text-white">
                        {new Date(selectedShow?.startTime).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                </p>
                <p className="text-gray-600 text-xs mb-6 font-mono">
                    Mã đặt vé: {success._id?.slice(-8).toUpperCase()}
                </p>
                <div className="flex gap-3">
                    <button onClick={() => navigate(`/${PATH.MY_TICKETS}`)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium transition">
                        Xem vé của tôi
                    </button>
                    <button onClick={() => navigate(PATH.HOME)}
                        className="flex-1 border border-gray-700 text-gray-300 hover:text-white py-2.5 rounded-xl text-sm transition">
                        Trang chủ
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800 px-4 py-4">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition">
                        ← Quay lại
                    </button>
                    <div className="flex items-center gap-3">
                        {movie?.poster && <img src={movie.poster} alt={movie.movieName} className="w-8 h-12 object-cover rounded" />}
                        <div>
                            <p className="text-white font-semibold">{movie?.movieName}</p>
                            <p className="text-gray-500 text-xs">{movie?.duration} phút</p>
                        </div>
                    </div>
                    {/* Steps */}
                    <div className="ml-auto hidden sm:flex items-center gap-2 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${step >= 1 ? "bg-red-500 text-white" : "bg-gray-800 text-gray-500"}`}>
                            1. Chọn suất
                        </span>
                        <span className="text-gray-700">→</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${step >= 2 ? "bg-red-500 text-white" : "bg-gray-800 text-gray-500"}`}>
                            2. Chọn ghế
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6">
                {/* Step 1: Show selection */}
                {step === 1 && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <h2 className="text-lg font-bold">Chọn suất chiếu</h2>
                            <input
                                type="date"
                                value={selectedDate}
                                min={new Date().toISOString().slice(0, 10)}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                            />
                        </div>

                        {Object.keys(showsByTheater).length === 0 ? (
                            <div className="bg-gray-900 rounded-xl p-10 text-center text-gray-600 border border-gray-800">
                                Không có suất chiếu nào cho ngày này
                            </div>
                        ) : (
                            Object.values(showsByTheater).map(({ theater, shows: ts }) => (
                                <div key={theater?._id} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                                    <p className="text-white font-semibold mb-1">{theater?.theaterName}</p>
                                    {theater?.location && <p className="text-gray-500 text-xs mb-3">{theater.address}</p>}
                                    <div className="flex flex-wrap gap-2">
                                        {ts.map((s) => (
                                            <button key={s._id}
                                                onClick={() => { setSelectedShow(s); setStep(2); }}
                                                className="flex flex-col items-center bg-gray-800 hover:bg-red-500/20 border border-gray-700 hover:border-red-500 text-white px-4 py-2.5 rounded-lg transition group min-w-[80px]"
                                            >
                                                <span className="text-sm font-semibold group-hover:text-red-400">
                                                    {new Date(s.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                                <span className="text-gray-500 text-xs mt-0.5 group-hover:text-gray-300">
                                                    {s.roomId?.roomNumber} · {s.price?.toLocaleString("vi-VN")}đ
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Step 2 loading fallback */}
                {step === 2 && !selectedShow && (
                    <div className="text-center text-gray-500 py-20 animate-pulse">Đang tải suất chiếu...</div>
                )}

                {/* Step 2: Seat selection */}
                {step === 2 && selectedShow && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Seat map */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white text-sm transition">
                                    ← Đổi suất
                                </button>
                                <div>
                                    <p className="text-white font-semibold">{selectedShow.theaterId?.theaterName}</p>
                                    <p className="text-gray-400 text-xs">
                                        {new Date(selectedShow.startTime).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                                        {" – "}
                                        {new Date(selectedShow.endTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                        {" · "}{selectedShow.roomId?.roomNumber}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                                {seatsLoading ? (
                                    <div className="text-center text-gray-500 py-12 animate-pulse">Đang tải sơ đồ ghế...</div>
                                ) : seats.length === 0 ? (
                                    <div className="text-center text-gray-600 py-12">Phòng chiếu chưa có sơ đồ ghế</div>
                                ) : (
                                    <SeatMap seats={seats} selected={selected} onToggle={toggleSeat} />
                                )}
                            </div>
                        </div>

                        {/* Summary panel */}
                        <div className="space-y-4">
                            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 sticky top-4">
                                <h3 className="text-white font-bold mb-4">Thông tin đặt vé</h3>
                                {movie?.poster && (
                                    <img src={movie.poster} alt={movie.movieName}
                                        className="w-full h-36 object-cover rounded-lg mb-3" />
                                )}
                                <p className="text-white font-semibold text-sm mb-3">{movie?.movieName}</p>
                                <div className="space-y-1.5 text-sm text-gray-400 mb-4">
                                    <div className="flex justify-between">
                                        <span>Rạp</span>
                                        <span className="text-white text-right max-w-[140px] truncate">{selectedShow.theaterId?.theaterName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Giờ chiếu</span>
                                        <span className="text-white">
                                            {new Date(selectedShow.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Phòng</span>
                                        <span className="text-white">{selectedShow.roomId?.roomNumber || "—"}</span>
                                    </div>
                                </div>

                                {selectedSeats.length > 0 ? (
                                    <div className="border-t border-gray-800 pt-3 space-y-1.5 mb-4">
                                        {selectedSeats.map((s) => (
                                            <div key={s._id} className="flex justify-between text-sm">
                                                <span className="text-gray-300">
                                                    {s.seatNumber}
                                                    <span className="text-gray-600 text-xs ml-1">({TYPE_LABEL[s.seatType]})</span>
                                                </span>
                                                <span className="text-white">
                                                    {Math.round((selectedShow.price || 0) * (PRICE_MULT[s.seatType] || 1)).toLocaleString("vi-VN")}đ
                                                </span>
                                            </div>
                                        ))}
                                        <div className="border-t border-gray-800 pt-2 mt-2 space-y-1">
                                            {promoDiscount > 0 && (
                                                <>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-400">Tạm tính</span>
                                                        <span className="text-gray-400">{totalPrice.toLocaleString("vi-VN")}đ</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-green-400">Giảm ({promoApplied})</span>
                                                        <span className="text-green-400">-{promoDiscount.toLocaleString("vi-VN")}đ</span>
                                                    </div>
                                                </>
                                            )}
                                            <div className="flex justify-between font-bold text-sm">
                                                <span className="text-gray-300">Tổng cộng</span>
                                                <span className="text-red-400">{finalPrice.toLocaleString("vi-VN")}đ</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-600 text-sm text-center py-3 border-t border-gray-800 mt-3 mb-4">
                                        Chọn ghế để xem giá
                                    </p>
                                )}

                                {/* Promo code */}
                                {selectedSeats.length > 0 && !promoApplied && (
                                    <div className="mb-3">
                                        <div className="flex gap-2">
                                            <input
                                                value={promoInput}
                                                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                                placeholder="Mã khuyến mãi"
                                                className="flex-1 bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                            />
                                            <button
                                                onClick={applyPromo}
                                                disabled={promoLoading || !promoInput.trim()}
                                                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs px-3 py-2 rounded-lg transition"
                                            >
                                                {promoLoading ? "..." : "Áp dụng"}
                                            </button>
                                        </div>
                                        {promoError && <p className="text-red-400 text-xs mt-1">{promoError}</p>}
                                    </div>
                                )}
                                {promoApplied && (
                                    <div className="flex items-center justify-between text-xs bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2 mb-3">
                                        <span className="text-green-400">✓ {promoApplied} đã áp dụng</span>
                                        <button
                                            onClick={() => { setPromoApplied(null); setPromoDiscount(0); setPromoInput(""); }}
                                            className="text-gray-500 hover:text-red-400 transition"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}

                                {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

                                <button
                                    onClick={handleBook}
                                    disabled={selected.size === 0 || booking}
                                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {booking ? "Đang xử lý..." : isAuthenticated
                                        ? `Đặt ${selected.size} ghế`
                                        : "Đăng nhập để đặt vé"}
                                </button>
                                {!isAuthenticated && (
                                    <p className="text-gray-600 text-xs text-center mt-2">
                                        Bạn cần đăng nhập để hoàn tất đặt vé
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

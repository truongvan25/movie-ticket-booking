import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import movieApi from "../../api/modules/movie.api.js";
import customerApi from "../../api/modules/customer.api.js";
import { PATH } from "../../routes/path.js";

const AGE_COLOR = {
    P: "bg-green-500",
    K: "bg-blue-500",
    T13: "bg-yellow-500",
    T16: "bg-orange-500",
    T18: "bg-red-600",
};

function StarRating({ value }) {
    return (
        <div className="flex items-center gap-2">
            <div className="relative inline-block text-xl leading-none tracking-widest">
                <span className="text-gray-700">{"★★★★★"}</span>
                <span
                    className="absolute inset-0 overflow-hidden text-yellow-400"
                    style={{ width: `${(value / 10) * 100}%` }}
                >
                    {"★★★★★"}
                </span>
            </div>
            <span className="text-yellow-400 font-bold">{value.toFixed(1)}</span>
            <span className="text-gray-500 text-sm">/ 10</span>
        </div>
    );
}

function ReviewForm({ movieId, onAdded }) {
    const { isAuthenticated } = useSelector((s) => s.auth);
    const [rating, setRating] = useState(8);
    const [comment, setComment] = useState("");
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");

    if (!isAuthenticated) return (
        <p className="text-gray-500 text-sm italic">Đăng nhập để viết đánh giá.</p>
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        setSaving(true);
        try {
            const res = await customerApi.addReview({ movieId, rating, comment });
            onAdded(res?.data || res);
            setComment("");
            setRating(8);
        } catch (e) {
            setErr(e?.message || "Gửi thất bại!");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-4 space-y-3">
            <h4 className="text-white font-medium text-sm">Viết đánh giá của bạn</h4>
            <div className="flex items-center gap-3">
                <label className="text-gray-400 text-sm w-24 shrink-0">Điểm ({rating}/10)</label>
                <input
                    type="range" min={1} max={10} value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="flex-1 accent-red-500"
                />
                <span className="text-yellow-400 font-bold w-6 text-right">{rating}</span>
            </div>
            <textarea
                value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
                rows={3} required
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 resize-none"
            />
            {err && <p className="text-red-400 text-xs">{err}</p>}
            <div className="flex justify-end">
                <button type="submit" disabled={saving}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
                    {saving ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
            </div>
        </form>
    );
}

export default function MovieDetails() {
    const { movieId } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [shows, setShows] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().slice(0, 10)
    );

    useEffect(() => {
        if (!movieId) return;
        setLoading(true);
        Promise.all([
            movieApi.getById(movieId),
            customerApi.getMovieReviews(movieId),
        ]).then(([mv, rv]) => {
            setMovie(mv?.data || mv);
            setReviews(rv?.data || rv || []);
        }).finally(() => setLoading(false));
    }, [movieId]);

    useEffect(() => {
        if (!movieId) return;
        customerApi.getShows({ movieId, date: selectedDate })
            .then((res) => setShows(res?.data || []));
    }, [movieId, selectedDate]);

    const showsByTheater = shows.reduce((acc, s) => {
        const tid = String(s.theaterId?._id || s.theaterId);
        if (!acc[tid]) acc[tid] = { theater: s.theaterId, shows: [] };
        acc[tid].shows.push(s);
        return acc;
    }, {});

    const avgRating = reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : null;

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-gray-500 animate-pulse text-lg">Đang tải...</div>
        </div>
    );

    if (!movie) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-gray-500">Không tìm thấy phim.</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Hero */}
            <div className="relative">
                {movie.poster && (
                    <div className="absolute inset-0 h-72 overflow-hidden">
                        <img src={movie.poster} alt="" className="w-full h-full object-cover opacity-20 blur-sm scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/30 via-gray-950/60 to-gray-950" />
                    </div>
                )}
                <div className="relative max-w-5xl mx-auto px-4 py-10">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="shrink-0 mx-auto md:mx-0">
                            {movie.poster
                                ? <img src={movie.poster} alt={movie.movieName}
                                    className="w-44 h-64 md:w-52 md:h-76 object-cover rounded-2xl shadow-2xl" />
                                : <div className="w-44 h-64 bg-gray-800 rounded-2xl flex items-center justify-center text-5xl">🎬</div>
                            }
                        </div>
                        <div className="flex-1 flex flex-col justify-end pb-2">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className={`text-xs px-2 py-0.5 rounded font-bold text-white ${AGE_COLOR[movie.ageRating] || "bg-gray-600"}`}>
                                    {movie.ageRating}
                                </span>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                    movie.status === "ongoing" ? "bg-green-500/20 text-green-400"
                                    : movie.status === "coming-soon" ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-gray-500/20 text-gray-400"
                                }`}>
                                    {movie.status === "ongoing" ? "Đang chiếu" : movie.status === "coming-soon" ? "Sắp chiếu" : "Đã kết thúc"}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold mb-3">{movie.movieName}</h1>
                            <div className="flex flex-wrap gap-4 text-gray-400 text-sm mb-3">
                                <span>⏱ {movie.duration} phút</span>
                                {movie.releaseDate && (
                                    <span>📅 {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}</span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {(movie.genres || []).map((g) => (
                                    <span key={g} className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">{g}</span>
                                ))}
                            </div>
                            {avgRating !== null && <div className="mb-3"><StarRating value={avgRating} /></div>}
                            <div className="mt-2 flex items-center gap-3 flex-wrap">
                                <button
                                    onClick={() => navigate(`/${PATH.BOOKING}/${movieId}`)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-7 py-2.5 rounded-xl font-semibold transition shadow-lg"
                                >
                                    🎫 Đặt vé ngay
                                </button>
                                <button
                                    onClick={async () => {
                                        const url = window.location.href;
                                        if (navigator.share) {
                                            try {
                                                await navigator.share({ title: movie.movieName, url });
                                            } catch {}
                                        } else {
                                            await navigator.clipboard.writeText(url);
                                            alert("Đã sao chép liên kết!");
                                        }
                                    }}
                                    className="border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
                                >
                                    ↗ Chia sẻ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 pb-16 space-y-10">
                {movie.description && (
                    <section>
                        <h2 className="text-xl font-bold mb-3">Nội dung phim</h2>
                        <p className="text-gray-400 leading-relaxed">{movie.description}</p>
                    </section>
                )}

                {/* Lịch chiếu */}
                <section>
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <h2 className="text-xl font-bold">Lịch chiếu</h2>
                        <input
                            type="date"
                            value={selectedDate}
                            min={new Date().toISOString().slice(0, 10)}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                        />
                    </div>
                    {Object.keys(showsByTheater).length === 0 ? (
                        <div className="bg-gray-900 rounded-xl p-8 text-center text-gray-600 border border-gray-800">
                            Không có suất chiếu nào cho ngày này
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {Object.values(showsByTheater).map(({ theater, shows: ts }) => (
                                <div key={theater?._id} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                                    <p className="text-white font-semibold mb-1">{theater?.theaterName}</p>
                                    {theater?.location && <p className="text-gray-500 text-xs mb-3">{theater.address}</p>}
                                    <div className="flex flex-wrap gap-2">
                                        {ts.map((s) => (
                                            <button
                                                key={s._id}
                                                onClick={() => navigate(`/${PATH.BOOKING}/${movieId}?showId=${s._id}`)}
                                                className="flex flex-col items-center bg-gray-800 hover:bg-red-500/20 border border-gray-700 hover:border-red-500 text-white px-4 py-2.5 rounded-lg transition group min-w-[80px]"
                                            >
                                                <span className="text-sm font-semibold group-hover:text-red-400">
                                                    {new Date(s.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                                <span className="text-gray-500 text-xs group-hover:text-gray-300 mt-0.5">
                                                    {s.price?.toLocaleString("vi-VN")}đ
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Reviews */}
                <section>
                    <h2 className="text-xl font-bold mb-4">Đánh giá ({reviews.length})</h2>
                    <div className="space-y-4">
                        <ReviewForm movieId={movieId} onAdded={(r) => setReviews((prev) => [r, ...prev])} />
                        {reviews.length === 0 ? (
                            <p className="text-gray-600 text-sm text-center py-6">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                        ) : reviews.map((r) => (
                            <div key={r._id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white font-medium text-sm">{r.userId?.userName || "Ẩn danh"}</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-yellow-400 text-sm">★ {r.rating}/10</span>
                                        <span className="text-gray-600 text-xs ml-2">
                                            {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">{r.comment}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

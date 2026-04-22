import React, { useEffect, useState, useMemo } from "react";
import managerApi from "../../api/modules/manager.api.js";

const STATUS_STYLE = {
    planned:   "bg-blue-500/20 text-blue-400",
    ongoing:   "bg-green-500/20 text-green-400",
    finished:  "bg-gray-500/20 text-gray-400",
    cancelled: "bg-red-500/20 text-red-400",
    expired:   "bg-orange-500/20 text-orange-400",
};
const STATUS_LABEL = {
    planned: "Sắp chiếu", ongoing: "Đang chiếu",
    finished: "Đã kết thúc", cancelled: "Đã hủy", expired: "Hết hạn",
};

const getDisplayStatus = (show) => {
    if (show.status === "cancelled") return "cancelled";
    if (new Date(show.endTime) < new Date()) return "expired";
    if (new Date(show.startTime) <= new Date() && new Date(show.endTime) >= new Date()) return "ongoing";
    return show.status;
};

function ManagerShows() {
    const [shows, setShows] = useState([]);
    const [movies, setMovies] = useState([]);
    const [theaters, setTheaters] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ movieId: "", theaterId: "", roomId: "", startTime: "", price: 90000 });
    const [saving, setSaving] = useState(false);

    // Bộ lọc
    const [filterMovie, setFilterMovie] = useState("");
    const [filterTheater, setFilterTheater] = useState("");
    const [filterRoom, setFilterRoom] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    useEffect(() => {
        Promise.all([
            managerApi.getShows(),
            managerApi.getMovies(),
            managerApi.getTheaters(),
            managerApi.getRooms(),
        ]).then(([s, m, t, r]) => {
            setShows(s?.data || []);
            const mv = m?.data || [];
            const th = t?.data || [];
            const rm = r?.data || [];
            setMovies(mv);
            setTheaters(th);
            setRooms(rm);
            setForm((f) => ({
                ...f,
                movieId: mv[0]?._id || "",
                theaterId: th[0]?._id || "",
                roomId: rm[0]?._id || "",
            }));
        }).finally(() => setLoading(false));
    }, []);

    // Phòng theo rạp đã chọn trong form
    const filteredRoomsForForm = rooms.filter(
        (r) => String(r.theaterId?._id || r.theaterId) === form.theaterId
    );

    // Phòng theo rạp đang lọc
    const filteredRoomsForFilter = rooms.filter(
        (r) => !filterTheater || String(r.theaterId?._id || r.theaterId) === filterTheater
    );

    // Áp dụng bộ lọc client-side
    const filtered = useMemo(() => {
        return shows.filter((s) => {
            const displayStatus = getDisplayStatus(s);
            if (filterMovie && !s.movieId?.movieName?.toLowerCase().includes(filterMovie.toLowerCase())) return false;
            if (filterTheater && String(s.theaterId?._id || s.theaterId) !== filterTheater) return false;
            if (filterRoom && String(s.roomId?._id || s.roomId) !== filterRoom) return false;
            if (filterStatus && displayStatus !== filterStatus) return false;
            return true;
        });
    }, [shows, filterMovie, filterTheater, filterRoom, filterStatus]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await managerApi.addShow(form);
            setShows((prev) => [res?.data?.show, ...prev]);
            setShowForm(false);
        } catch (err) {
            alert(err?.data?.message || "Thêm lịch chiếu thất bại!");
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa lịch chiếu này?")) return;
        try {
            await managerApi.deleteShow(id);
            setShows((prev) => prev.filter((s) => s._id !== id));
        } catch { alert("Xóa thất bại!"); }
    };

    const hasFilter = filterMovie || filterTheater || filterRoom || filterStatus;
    const clearFilters = () => { setFilterMovie(""); setFilterTheater(""); setFilterRoom(""); setFilterStatus(""); };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Quản lý lịch chiếu</h2>
                <button onClick={() => setShowForm(!showForm)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                    + Thêm lịch chiếu
                </button>
            </div>

            {/* Form thêm */}
            {showForm && (
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
                    <h3 className="text-white font-semibold mb-4">Thêm lịch chiếu mới</h3>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Phim</label>
                            <select value={form.movieId} onChange={(e) => setForm({ ...form, movieId: e.target.value })} required
                                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500">
                                {movies.map((m) => <option key={m._id} value={m._id}>{m.movieName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Rạp phim</label>
                            <select value={form.theaterId}
                                onChange={(e) => setForm({ ...form, theaterId: e.target.value, roomId: "" })} required
                                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500">
                                {theaters.map((t) => <option key={t._id} value={t._id}>{t.theaterName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Phòng chiếu</label>
                            <select value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })} required
                                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500">
                                <option value="">-- Chọn phòng --</option>
                                {filteredRoomsForForm.map((r) => <option key={r._id} value={r._id}>{r.roomNumber}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Giờ bắt đầu</label>
                            <input type="datetime-local" value={form.startTime}
                                onChange={(e) => setForm({ ...form, startTime: e.target.value })} required
                                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500" />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Giá vé (VND)</label>
                            <input type="number" value={form.price} min={0} required
                                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500" />
                        </div>
                        <div className="sm:col-span-2 flex gap-3 justify-end">
                            <button type="button" onClick={() => setShowForm(false)}
                                className="border border-gray-600 text-gray-400 px-4 py-2 rounded-lg text-sm hover:text-white transition">Hủy</button>
                            <button type="submit" disabled={saving}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
                                {saving ? "Đang lưu..." : "Thêm lịch chiếu"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Bộ lọc */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Tìm tên phim */}
                    <div>
                        <label className="block text-gray-500 text-xs mb-1">Tên phim</label>
                        <input value={filterMovie} onChange={(e) => setFilterMovie(e.target.value)}
                            placeholder="Nhập tên phim..."
                            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500" />
                    </div>
                    {/* Lọc theo rạp */}
                    <div>
                        <label className="block text-gray-500 text-xs mb-1">Rạp chiếu</label>
                        <select value={filterTheater}
                            onChange={(e) => { setFilterTheater(e.target.value); setFilterRoom(""); }}
                            className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500">
                            <option value="">Tất cả rạp</option>
                            {theaters.map((t) => <option key={t._id} value={t._id}>{t.theaterName}</option>)}
                        </select>
                    </div>
                    {/* Lọc theo phòng */}
                    <div>
                        <label className="block text-gray-500 text-xs mb-1">Phòng chiếu</label>
                        <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500">
                            <option value="">Tất cả phòng</option>
                            {filteredRoomsForFilter.map((r) => (
                                <option key={r._id} value={r._id}>{r.roomNumber} — {r.theaterId?.theaterName}</option>
                            ))}
                        </select>
                    </div>
                    {/* Lọc theo trạng thái */}
                    <div>
                        <label className="block text-gray-500 text-xs mb-1">Trạng thái</label>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500">
                            <option value="">Tất cả</option>
                            {Object.entries(STATUS_LABEL).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {hasFilter && (
                    <div className="mt-3 flex items-center gap-2">
                        <span className="text-gray-500 text-xs">Kết quả: {filtered.length} / {shows.length} lịch chiếu</span>
                        <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 border border-red-400/30 px-2 py-0.5 rounded transition">
                            Xóa bộ lọc
                        </button>
                    </div>
                )}
            </div>

            {/* Bảng */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 border-b border-gray-800">
                                <th className="text-left px-4 py-3 font-medium">Phim</th>
                                <th className="text-left px-4 py-3 font-medium">Rạp / Phòng</th>
                                <th className="text-left px-4 py-3 font-medium">Giờ chiếu</th>
                                <th className="text-left px-4 py-3 font-medium">Giá vé</th>
                                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                                <th className="text-left px-4 py-3 font-medium">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-gray-800/50">
                                        {[...Array(6)].map((_, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-gray-600">
                                        {hasFilter ? "Không có lịch chiếu nào khớp bộ lọc" : "Chưa có lịch chiếu nào"}
                                    </td>
                                </tr>
                            ) : filtered.map((s) => {
                                const displayStatus = getDisplayStatus(s);
                                return (
                                    <tr key={s._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                                        <td className="px-4 py-3 text-white font-medium max-w-[160px] truncate">
                                            {s.movieId?.movieName || "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-300 text-xs">{s.theaterId?.theaterName}</p>
                                            <p className="text-gray-500 text-xs">{s.roomId?.roomNumber}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">
                                            <p>{new Date(s.startTime).toLocaleDateString("vi-VN")}</p>
                                            <p>
                                                {new Date(s.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                                {" – "}
                                                {new Date(s.endTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-white">{s.price?.toLocaleString("vi-VN")}đ</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[displayStatus] || ""}`}>
                                                {STATUS_LABEL[displayStatus] || displayStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => handleDelete(s._id)}
                                                className="text-xs px-2.5 py-1 rounded border border-red-400/30 text-red-400 hover:border-red-400 transition">
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-gray-800 text-gray-500 text-xs">
                    {hasFilter ? `${filtered.length} / ${shows.length}` : shows.length} lịch chiếu
                </div>
            </div>
        </div>
    );
}

export default ManagerShows;

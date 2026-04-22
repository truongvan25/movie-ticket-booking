import React, { useEffect, useState, useCallback } from "react";
import managerApi from "../../api/modules/manager.api.js";

const STATUS_OPTIONS = [
    { value: "", label: "Tất cả" },
    { value: "ongoing", label: "Đang chiếu" },
    { value: "coming-soon", label: "Sắp chiếu" },
    { value: "ended", label: "Đã kết thúc" },
];
const STATUS_STYLE = {
    "ongoing":     "bg-green-500/20 text-green-400",
    "coming-soon": "bg-yellow-500/20 text-yellow-400",
    "ended":       "bg-gray-500/20 text-gray-400",
};

const EMPTY_FORM = { movieName: "", description: "", genres: "", duration: "", releaseDate: "", poster: "", ageRating: "T13", status: "coming-soon" };

function ManagerMovies() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editMovie, setEditMovie] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const fetchMovies = useCallback(async () => {
        setLoading(true);
        try {
            const res = await managerApi.getMovies({ status: statusFilter, search });
            setMovies(res?.data || []);
        } finally { setLoading(false); }
    }, [statusFilter, search]);

    useEffect(() => { fetchMovies(); }, [fetchMovies]);

    const openAdd = () => { setEditMovie(null); setForm(EMPTY_FORM); setShowForm(true); };
    const openEdit = (m) => {
        setEditMovie(m);
        setForm({
            movieName: m.movieName, description: m.description || "",
            genres: (m.genres || []).join(", "), duration: m.duration,
            releaseDate: m.releaseDate?.slice(0, 10) || "",
            poster: m.poster || "", ageRating: m.ageRating || "T13", status: m.status,
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, genres: form.genres.split(",").map((g) => g.trim()).filter(Boolean), duration: Number(form.duration) };
            if (editMovie) {
                await managerApi.updateMovie(editMovie._id, payload);
                setMovies((prev) => prev.map((m) => m._id === editMovie._id ? { ...m, ...payload } : m));
            } else {
                const res = await managerApi.addMovie(payload);
                setMovies((prev) => [res?.data?.movie, ...prev]);
            }
            setShowForm(false);
        } catch (err) {
            alert(err?.data?.message || err?.message || "Lưu thất bại!");
        } finally { setSaving(false); }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Xóa phim "${name}"?`)) return;
        try {
            await managerApi.deleteMovie(id);
            setMovies((prev) => prev.filter((m) => m._id !== id));
        } catch { alert("Xóa thất bại!"); }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <h2 className="text-white font-bold text-lg">Quản lý phim</h2>
                <div className="flex gap-2 flex-wrap">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500">
                        {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput.trim()); }} className="flex gap-2">
                        <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Tìm theo tên phim..."
                            className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-lg px-3 py-2 w-44 focus:outline-none focus:border-red-500" />
                        <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition">Tìm</button>
                        {search && <button type="button" onClick={() => { setSearch(""); setSearchInput(""); }} className="border border-gray-600 text-gray-400 px-3 py-2 rounded-lg text-sm">✕</button>}
                    </form>
                    <button onClick={openAdd} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                        + Thêm phim
                    </button>
                </div>
            </div>

            {/* Form thêm/sửa */}
            {showForm && (
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
                    <h3 className="text-white font-semibold mb-4">{editMovie ? "Chỉnh sửa phim" : "Thêm phim mới"}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { name: "movieName", label: "Tên phim", required: true },
                            { name: "genres", label: "Thể loại (cách nhau bằng dấu phẩy)", required: true },
                            { name: "duration", label: "Thời lượng (phút)", type: "number", required: true },
                            { name: "releaseDate", label: "Ngày khởi chiếu", type: "date" },
                            { name: "poster", label: "URL poster" },
                            { name: "ageRating", label: "Xếp hạng độ tuổi" },
                        ].map(({ name, label, type = "text", required }) => (
                            <div key={name}>
                                <label className="block text-gray-400 text-xs mb-1">{label}</label>
                                <input type={type} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                                    required={required}
                                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500" />
                            </div>
                        ))}
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Trạng thái</label>
                            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500">
                                {STATUS_OPTIONS.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-gray-400 text-xs mb-1">Mô tả</label>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500" />
                        </div>
                        <div className="sm:col-span-2 flex gap-3 justify-end">
                            <button type="button" onClick={() => setShowForm(false)} className="border border-gray-600 text-gray-400 px-4 py-2 rounded-lg text-sm hover:text-white transition">Hủy</button>
                            <button type="submit" disabled={saving} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
                                {saving ? "Đang lưu..." : editMovie ? "Cập nhật" : "Thêm phim"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 border-b border-gray-800">
                                <th className="text-left px-4 py-3 font-medium">Phim</th>
                                <th className="text-left px-4 py-3 font-medium">Thể loại</th>
                                <th className="text-left px-4 py-3 font-medium">Thời lượng</th>
                                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                                <th className="text-left px-4 py-3 font-medium">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? [...Array(4)].map((_, i) => (
                                <tr key={i} className="border-b border-gray-800/50">
                                    {[...Array(5)].map((_, j) => (
                                        <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" /></td>
                                    ))}
                                </tr>
                            )) : movies.length === 0 ? (
                                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-600">Chưa có phim nào</td></tr>
                            ) : movies.map((m) => (
                                <tr key={m._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {m.poster ? <img src={m.poster} alt={m.movieName} className="w-8 h-12 object-cover rounded" /> : <div className="w-8 h-12 bg-gray-700 rounded flex items-center justify-center text-gray-500 text-xs">🎬</div>}
                                            <p className="text-white font-medium max-w-[160px] truncate">{m.movieName}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 max-w-[120px] truncate">{m.genres?.join(", ")}</td>
                                    <td className="px-4 py-3 text-gray-400">{m.duration} phút</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[m.status] || "bg-gray-500/20 text-gray-400"}`}>
                                            {STATUS_OPTIONS.find((o) => o.value === m.status)?.label || m.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(m)} className="text-xs px-2.5 py-1 rounded border border-blue-400/30 text-blue-400 hover:border-blue-400 transition">Sửa</button>
                                            <button onClick={() => handleDelete(m._id, m.movieName)} className="text-xs px-2.5 py-1 rounded border border-red-400/30 text-red-400 hover:border-red-400 transition">Xóa</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-gray-800 text-gray-500 text-xs">{movies.length} bộ phim</div>
            </div>
        </div>
    );
}

export default ManagerMovies;

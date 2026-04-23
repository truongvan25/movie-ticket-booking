import React, { useEffect, useState, useCallback } from "react";
import adminApi from "../../api/modules/admin.api.js";
import Pagination from "../../components/common/Pagination.jsx";

const LIMIT = 20;

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

function AdminMovies() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editStatus, setEditStatus] = useState("");
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchMovies = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminApi.getMovies({ status: statusFilter, search, page, limit: LIMIT });
            const d = res?.data || {};
            setMovies(d.items || []);
            setTotal(d.total || 0);
            setTotalPages(d.totalPages || 1);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, search, page]);

    useEffect(() => { fetchMovies(); }, [fetchMovies]);
    useEffect(() => { setPage(1); }, [statusFilter, search]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    };

    const handleDelete = async (movieId, movieName) => {
        if (!window.confirm(`Xóa phim "${movieName}"?`)) return;
        try {
            await adminApi.deleteMovie(movieId);
            setMovies((prev) => prev.filter((m) => m._id !== movieId));
        } catch { alert("Xóa thất bại!"); }
    };

    const handleStatusSave = async (movieId) => {
        setSaving(true);
        try {
            await adminApi.updateMovie(movieId, { status: editStatus });
            setMovies((prev) => prev.map((m) => m._id === movieId ? { ...m, status: editStatus } : m));
            setEditingId(null);
        } catch { alert("Cập nhật thất bại!"); }
        finally { setSaving(false); }
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <h2 className="text-white font-bold text-lg">Quản lý phim</h2>
                <div className="flex gap-2 flex-wrap">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                    >
                        {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Tìm theo tên phim..."
                            className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-lg px-3 py-2 w-52 focus:outline-none focus:border-red-500"
                        />
                        <button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition">
                            Tìm
                        </button>
                        {search && (
                            <button type="button" onClick={() => { setSearch(""); setSearchInput(""); }}
                                className="border border-gray-600 text-gray-400 px-3 py-2 rounded-lg text-sm hover:text-white transition">
                                ✕
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {/* Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 border-b border-gray-800 bg-gray-900">
                                <th className="text-left px-4 py-3 font-medium">Phim</th>
                                <th className="text-left px-4 py-3 font-medium">Thể loại</th>
                                <th className="text-left px-4 py-3 font-medium">Thời lượng</th>
                                <th className="text-left px-4 py-3 font-medium">Xếp hạng</th>
                                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                                <th className="text-left px-4 py-3 font-medium">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i} className="border-b border-gray-800/50">
                                        {[...Array(6)].map((_, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : movies.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-gray-600">
                                        Không có phim nào
                                    </td>
                                </tr>
                            ) : movies.map((movie) => (
                                <tr key={movie._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {movie.poster ? (
                                                <img src={movie.poster} alt={movie.movieName} className="w-10 h-14 object-cover rounded" />
                                            ) : (
                                                <div className="w-10 h-14 bg-gray-700 rounded flex items-center justify-center text-gray-500 text-xs">🎬</div>
                                            )}
                                            <div>
                                                <p className="text-white font-medium max-w-[200px] truncate">{movie.movieName}</p>
                                                <p className="text-gray-500 text-xs">{new Date(movie.releaseDate).toLocaleDateString("vi-VN")}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 max-w-[140px]">
                                        <span className="truncate block">{movie.genres?.join(", ")}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">{movie.duration} phút</td>
                                    <td className="px-4 py-3">
                                        <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded font-bold">
                                            {movie.ageRating}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingId === movie._id ? (
                                            <div className="flex gap-1 items-center">
                                                <select
                                                    value={editStatus}
                                                    onChange={(e) => setEditStatus(e.target.value)}
                                                    className="bg-gray-800 border border-gray-700 text-white text-xs rounded px-2 py-1"
                                                >
                                                    {STATUS_OPTIONS.filter(o => o.value).map(o => (
                                                        <option key={o.value} value={o.value}>{o.label}</option>
                                                    ))}
                                                </select>
                                                <button onClick={() => handleStatusSave(movie._id)} disabled={saving}
                                                    className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700 transition">
                                                    ✓
                                                </button>
                                                <button onClick={() => setEditingId(null)}
                                                    className="bg-gray-700 text-white text-xs px-2 py-1 rounded hover:bg-gray-600 transition">
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <span
                                                onClick={() => { setEditingId(movie._id); setEditStatus(movie.status); }}
                                                className={`text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer hover:opacity-80 transition ${STATUS_STYLE[movie.status] || "bg-gray-500/20 text-gray-400"}`}
                                            >
                                                {STATUS_OPTIONS.find(o => o.value === movie.status)?.label || movie.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleDelete(movie._id, movie.movieName)}
                                            className="text-red-400 hover:text-red-300 text-xs border border-red-400/30 hover:border-red-400 px-2.5 py-1 rounded transition"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} />
            </div>
        </div>
    );
}

export default AdminMovies;

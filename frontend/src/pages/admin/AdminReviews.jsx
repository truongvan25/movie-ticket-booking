import React, { useEffect, useState, useCallback } from "react";
import adminApi from "../../api/modules/admin.api.js";
import Pagination from "../../components/common/Pagination.jsx";

const LIMIT = 20;

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [deleting, setDeleting] = useState(null);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminApi.getReviews({ page, limit: LIMIT });
            const d = res?.data || {};
            setReviews(d.items || []);
            setTotal(d.total || 0);
            setTotalPages(d.totalPages || 1);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    const handleDelete = async (review) => {
        if (!window.confirm(`Xóa đánh giá của "${review.userId?.userName}" về phim "${review.movieId?.movieName}"?`)) return;
        setDeleting(review._id);
        try {
            await adminApi.deleteReview(review._id);
            setReviews((prev) => prev.filter((r) => r._id !== review._id));
            setTotal((prev) => prev - 1);
        } catch {
            alert("Xóa thất bại!");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Quản lý đánh giá</h2>
                <span className="text-gray-500 text-sm">{total} đánh giá</span>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 border-b border-gray-800">
                                <th className="text-left px-4 py-3 font-medium">Người dùng</th>
                                <th className="text-left px-4 py-3 font-medium">Phim</th>
                                <th className="text-left px-4 py-3 font-medium w-12">Điểm</th>
                                <th className="text-left px-4 py-3 font-medium">Nội dung</th>
                                <th className="text-left px-4 py-3 font-medium">Ngày</th>
                                <th className="text-left px-4 py-3 font-medium">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i} className="border-b border-gray-800/50">
                                        {[...Array(6)].map((_, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-gray-600">
                                        Chưa có đánh giá nào
                                    </td>
                                </tr>
                            ) : reviews.map((r) => (
                                <tr key={r._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                                    <td className="px-4 py-3">
                                        <p className="text-white text-sm">{r.userId?.userName || "—"}</p>
                                        <p className="text-gray-500 text-xs">{r.userId?.email}</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-300 max-w-[160px] truncate">
                                        {r.movieId?.movieName || "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                            r.rating >= 8 ? "bg-green-500/20 text-green-400"
                                            : r.rating >= 5 ? "bg-yellow-500/20 text-yellow-400"
                                            : "bg-red-500/20 text-red-400"
                                        }`}>
                                            ★ {r.rating}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 max-w-[260px]">
                                        <p className="truncate text-xs">{r.comment}</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                        {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleDelete(r)}
                                            disabled={deleting === r._id}
                                            className="text-xs px-2.5 py-1 rounded border border-red-400/30 text-red-400 hover:border-red-400 transition disabled:opacity-50"
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

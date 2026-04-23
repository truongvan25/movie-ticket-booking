import React, { useEffect, useState } from "react";
import managerApi from "../../api/modules/manager.api.js";
import Pagination from "../../components/common/Pagination.jsx";

const LIMIT = 20;

const ratingColor = (r) => {
    if (r >= 8) return "bg-green-500/20 text-green-400";
    if (r >= 5) return "bg-yellow-500/20 text-yellow-400";
    return "bg-red-500/20 text-red-400";
};

function ManagerReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchReviews = (p = 1) => {
        setLoading(true);
        managerApi.getReviews({ page: p, limit: LIMIT })
            .then((res) => {
                const d = res?.data;
                setReviews(d?.items || []);
                setTotal(d?.total || 0);
                setTotalPages(d?.totalPages || 1);
                setPage(d?.page || 1);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchReviews(1); }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Đánh giá phim</h2>
                {!loading && <p className="text-gray-500 text-sm">{total} đánh giá</p>}
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 border-b border-gray-800">
                                <th className="text-left px-4 py-3 font-medium">Người dùng</th>
                                <th className="text-left px-4 py-3 font-medium">Phim</th>
                                <th className="text-left px-4 py-3 font-medium">Điểm</th>
                                <th className="text-left px-4 py-3 font-medium">Bình luận</th>
                                <th className="text-left px-4 py-3 font-medium">Ngày</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i} className="border-b border-gray-800/50">
                                        {[...Array(5)].map((_, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-gray-600">
                                        Chưa có đánh giá nào
                                    </td>
                                </tr>
                            ) : reviews.map((r) => (
                                <tr key={r._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                                    <td className="px-4 py-3">
                                        <p className="text-white font-medium">{r.userId?.userName || "—"}</p>
                                        <p className="text-gray-500 text-xs">{r.userId?.email}</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-300 max-w-[160px] truncate">
                                        {r.movieId?.movieName || "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${ratingColor(r.rating)}`}>
                                            ⭐ {r.rating}/10
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 max-w-[260px] truncate" title={r.comment}>
                                        {r.comment}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                        {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-gray-800">
                    <Pagination page={page} totalPages={totalPages} total={total} onChange={(p) => fetchReviews(p)} />
                </div>
            </div>
        </div>
    );
}

export default ManagerReviews;

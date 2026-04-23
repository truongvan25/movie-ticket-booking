import React, { useEffect, useState, useCallback } from "react";
import adminApi from "../../api/modules/admin.api.js";
import Pagination from "../../components/common/Pagination.jsx";

const LIMIT = 20;

const STATUS_OPTIONS = [
    { value: "", label: "Tất cả" },
    { value: "open", label: "Đang mở" },
    { value: "in-progress", label: "Đang xử lý" },
    { value: "resolved", label: "Đã giải quyết" },
    { value: "closed", label: "Đã đóng" },
];
const STATUS_STYLE = {
    open:          "bg-blue-500/20 text-blue-400",
    "in-progress": "bg-yellow-500/20 text-yellow-400",
    resolved:      "bg-green-500/20 text-green-400",
    closed:        "bg-gray-500/20 text-gray-400",
};

export default function AdminSupport() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [expanded, setExpanded] = useState(null);
    const [replyForm, setReplyForm] = useState({ reply: "", status: "" });
    const [replying, setReplying] = useState(null);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminApi.getSupport({ status: statusFilter, page });
            const d = res?.data || {};
            setTickets(d.items || []);
            setTotal(d.total || 0);
            setTotalPages(d.totalPages || 1);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, page]);

    useEffect(() => { fetchTickets(); }, [fetchTickets]);
    useEffect(() => { setPage(1); }, [statusFilter]);

    const handleExpand = (id) => {
        if (expanded === id) { setExpanded(null); return; }
        setExpanded(id);
        const ticket = tickets.find((t) => t._id === id);
        setReplyForm({ reply: ticket?.adminReply || "", status: ticket?.status || "open" });
    };

    const handleReply = async (ticketId) => {
        setReplying(ticketId);
        try {
            const res = await adminApi.replySupport(ticketId, {
                reply: replyForm.reply,
                status: replyForm.status,
            });
            const updated = res?.data || res;
            setTickets((prev) => prev.map((t) => t._id === ticketId ? { ...t, ...updated } : t));
            setExpanded(null);
        } catch {
            alert("Phản hồi thất bại!");
        } finally {
            setReplying(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-white font-bold text-lg">Yêu cầu hỗ trợ</h2>
                <div className="flex gap-2 items-center">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500">
                        {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <span className="text-gray-500 text-sm">{total} ticket</span>
                </div>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="px-4 py-12 text-center text-gray-600">Không có yêu cầu hỗ trợ nào</div>
                ) : (
                    <div className="divide-y divide-gray-800">
                        {tickets.map((t) => (
                            <div key={t._id}>
                                <button
                                    className="w-full p-4 text-left hover:bg-gray-800/40 transition"
                                    onClick={() => handleExpand(t._id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-white font-medium text-sm">{t.subject}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[t.status]}`}>
                                                    {STATUS_OPTIONS.find((o) => o.value === t.status)?.label}
                                                </span>
                                            </div>
                                            <p className="text-gray-500 text-xs mt-0.5">
                                                {t.userId?.userName} · {t.userId?.email} · {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                                            </p>
                                        </div>
                                        <span className="text-gray-600 text-xs shrink-0">
                                            {expanded === t._id ? "▲" : "▼"}
                                        </span>
                                    </div>
                                </button>

                                {expanded === t._id && (
                                    <div className="px-4 pb-5 pt-2 bg-gray-900/80 space-y-4 border-t border-gray-800">
                                        <div>
                                            <p className="text-gray-500 text-xs mb-1 uppercase tracking-wide font-medium">Nội dung</p>
                                            <p className="text-gray-300 text-sm leading-relaxed">{t.message}</p>
                                        </div>

                                        {t.adminReply && (
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                                                <p className="text-blue-400 text-xs font-medium mb-1">
                                                    Phản hồi trước · {t.repliedAt ? new Date(t.repliedAt).toLocaleDateString("vi-VN") : "—"}
                                                </p>
                                                <p className="text-gray-300 text-sm">{t.adminReply}</p>
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Phản hồi / Cập nhật</p>
                                            <textarea
                                                value={replyForm.reply}
                                                onChange={(e) => setReplyForm({ ...replyForm, reply: e.target.value })}
                                                placeholder="Nhập nội dung phản hồi..."
                                                rows={3}
                                                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 resize-none"
                                            />
                                            <div className="flex gap-3 items-center">
                                                <select
                                                    value={replyForm.status}
                                                    onChange={(e) => setReplyForm({ ...replyForm, status: e.target.value })}
                                                    className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                                                >
                                                    {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                                                        <option key={o.value} value={o.value}>{o.label}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => handleReply(t._id)}
                                                    disabled={replying === t._id}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                                                >
                                                    {replying === t._id ? "Đang gửi..." : "Gửi phản hồi"}
                                                </button>
                                                <button onClick={() => setExpanded(null)}
                                                    className="text-gray-500 hover:text-white text-sm transition px-2">
                                                    Đóng
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} />
            </div>
        </div>
    );
}

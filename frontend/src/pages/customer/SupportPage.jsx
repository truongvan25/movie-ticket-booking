import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import customerApi from "../../api/modules/customer.api.js";
import { PATH } from "../../routes/path.js";

const STATUS_STYLE = {
    open:        "bg-blue-500/20 text-blue-400",
    "in-progress": "bg-yellow-500/20 text-yellow-400",
    resolved:    "bg-green-500/20 text-green-400",
    closed:      "bg-gray-500/20 text-gray-400",
};
const STATUS_LABEL = {
    open: "Đang mở",
    "in-progress": "Đang xử lý",
    resolved: "Đã giải quyết",
    closed: "Đã đóng",
};

export default function SupportPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((s) => s.auth);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ subject: "", message: "" });
    const [sending, setSending] = useState(false);
    const [err, setErr] = useState("");
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) { navigate(`/auth/${PATH.SIGNIN}`); return; }
        customerApi.getMySupport()
            .then((r) => setTickets(r?.data || []))
            .finally(() => setLoading(false));
    }, [isAuthenticated]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        setSending(true);
        try {
            const res = await customerApi.createSupport(form);
            setTickets((prev) => [res?.data || res, ...prev]);
            setForm({ subject: "", message: "" });
            setShowForm(false);
        } catch (e) {
            setErr(e?.message || "Gửi thất bại!");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">Hỗ trợ khách hàng</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Gửi yêu cầu và theo dõi trạng thái xử lý</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => navigate(-1)}
                            className="text-gray-400 hover:text-white text-sm transition">
                            ← Quay lại
                        </button>
                    </div>
                </div>

                {/* Create ticket button */}
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="w-full mb-5 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
                >
                    {showForm ? "✕ Đóng form" : "+ Tạo yêu cầu hỗ trợ"}
                </button>

                {/* Form */}
                {showForm && (
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-5">
                        <h3 className="text-white font-semibold mb-4">Yêu cầu mới</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-xs mb-1">Tiêu đề</label>
                                <input
                                    value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    placeholder="Vd: Không thể thanh toán vé"
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-red-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-xs mb-1">Nội dung chi tiết</label>
                                <textarea
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    placeholder="Mô tả vấn đề của bạn..."
                                    rows={4} required
                                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-red-500 resize-none"
                                />
                            </div>
                            {err && <p className="text-red-400 text-xs">{err}</p>}
                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="border border-gray-700 text-gray-400 hover:text-white px-4 py-2 rounded-lg text-sm transition">
                                    Hủy
                                </button>
                                <button type="submit" disabled={sending}
                                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
                                    {sending ? "Đang gửi..." : "Gửi yêu cầu"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Ticket list */}
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-gray-900 rounded-2xl h-20 animate-pulse border border-gray-800" />
                        ))}
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-14">
                        <div className="text-5xl mb-4">💬</div>
                        <p className="text-gray-500">Chưa có yêu cầu hỗ trợ nào</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tickets.map((t) => (
                            <div key={t._id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                                <button
                                    className="w-full p-4 text-left hover:bg-gray-800/40 transition"
                                    onClick={() => setExpanded(expanded === t._id ? null : t._id)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium text-sm truncate">{t.subject}</p>
                                            <p className="text-gray-500 text-xs mt-0.5">
                                                {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[t.status]}`}>
                                                {STATUS_LABEL[t.status]}
                                            </span>
                                            <span className="text-gray-600 text-xs">
                                                {expanded === t._id ? "▲" : "▼"}
                                            </span>
                                        </div>
                                    </div>
                                </button>

                                {expanded === t._id && (
                                    <div className="border-t border-gray-800 px-4 pb-4 pt-3 space-y-3">
                                        <div>
                                            <p className="text-gray-500 text-xs mb-1">Nội dung yêu cầu</p>
                                            <p className="text-gray-300 text-sm leading-relaxed">{t.message}</p>
                                        </div>
                                        {t.adminReply && (
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                                                <p className="text-blue-400 text-xs font-medium mb-1">
                                                    Phản hồi từ Admin · {new Date(t.repliedAt).toLocaleDateString("vi-VN")}
                                                </p>
                                                <p className="text-gray-300 text-sm leading-relaxed">{t.adminReply}</p>
                                            </div>
                                        )}
                                        {!t.adminReply && (
                                            <p className="text-gray-600 text-xs italic">Đang chờ phản hồi từ admin...</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

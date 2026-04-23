import React, { useEffect, useState } from "react";
import adminApi from "../../api/modules/admin.api.js";

const EMPTY_FORM = { code: "", discountType: "percent", discountValue: "", minOrderValue: "", maxUses: "", expiresAt: "" };

function AdminPromoCodes() {
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");

    const fetchCodes = () => {
        setLoading(true);
        adminApi.getPromoCodes()
            .then((res) => setCodes(res?.data || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchCodes(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        setSaving(true);
        try {
            await adminApi.createPromoCode({
                code: form.code,
                discountType: form.discountType,
                discountValue: Number(form.discountValue),
                minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
                maxUses: form.maxUses ? Number(form.maxUses) : null,
                expiresAt: form.expiresAt || null,
            });
            setForm(EMPTY_FORM);
            fetchCodes();
        } catch (e) {
            setErr(e?.message || "Tạo thất bại");
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (id, isActive) => {
        await adminApi.updatePromoCode(id, { isActive: !isActive });
        fetchCodes();
    };

    const handleDelete = async (id) => {
        if (!confirm("Xóa mã này?")) return;
        await adminApi.deletePromoCode(id);
        fetchCodes();
    };

    return (
        <div className="space-y-6">
            <h2 className="text-white font-bold text-lg">Quản lý mã khuyến mãi</h2>

            {/* Create form */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <h3 className="text-white font-semibold mb-4">Tạo mã mới</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                        <label className="text-gray-400 text-xs mb-1 block">Mã *</label>
                        <input
                            value={form.code}
                            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                            placeholder="SUMMER20"
                            required
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-xs mb-1 block">Loại giảm</label>
                        <select
                            value={form.discountType}
                            onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                        >
                            <option value="percent">Phần trăm (%)</option>
                            <option value="fixed">Số tiền cố định (đ)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-gray-400 text-xs mb-1 block">Giá trị giảm *</label>
                        <input
                            type="number" min={0}
                            value={form.discountValue}
                            onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                            placeholder={form.discountType === "percent" ? "20" : "50000"}
                            required
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-xs mb-1 block">Đơn tối thiểu (đ)</label>
                        <input
                            type="number" min={0}
                            value={form.minOrderValue}
                            onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
                            placeholder="0"
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-xs mb-1 block">Giới hạn lượt dùng</label>
                        <input
                            type="number" min={1}
                            value={form.maxUses}
                            onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                            placeholder="Không giới hạn"
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-xs mb-1 block">Ngày hết hạn</label>
                        <input
                            type="date"
                            value={form.expiresAt}
                            onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3">
                        {err && <p className="text-red-400 text-xs">{err}</p>}
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition ml-auto"
                        >
                            {saving ? "Đang tạo..." : "+ Tạo mã"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Code list */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 border-b border-gray-800">
                                <th className="text-left px-4 py-3 font-medium">Mã</th>
                                <th className="text-left px-4 py-3 font-medium">Giảm</th>
                                <th className="text-left px-4 py-3 font-medium">Đơn tối thiểu</th>
                                <th className="text-left px-4 py-3 font-medium">Đã dùng</th>
                                <th className="text-left px-4 py-3 font-medium">Hạn</th>
                                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i} className="border-b border-gray-800/50">
                                        {[...Array(7)].map((_, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : codes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-gray-600">
                                        Chưa có mã khuyến mãi nào
                                    </td>
                                </tr>
                            ) : codes.map((c) => (
                                <tr key={c._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                                    <td className="px-4 py-3 font-mono font-bold text-white">{c.code}</td>
                                    <td className="px-4 py-3 text-gray-300">
                                        {c.discountType === "percent"
                                            ? `${c.discountValue}%`
                                            : `${c.discountValue.toLocaleString("vi-VN")}đ`}
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">
                                        {c.minOrderValue ? `${c.minOrderValue.toLocaleString("vi-VN")}đ` : "—"}
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">
                                        {c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">
                                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("vi-VN") : "Không giới hạn"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleToggle(c._id, c.isActive)}
                                            className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                                                c.isActive
                                                    ? "bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400"
                                                    : "bg-gray-500/20 text-gray-400 hover:bg-green-500/20 hover:text-green-400"
                                            }`}
                                        >
                                            {c.isActive ? "Đang hoạt động" : "Đã tắt"}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleDelete(c._id)}
                                            className="text-gray-600 hover:text-red-400 transition text-xs"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminPromoCodes;

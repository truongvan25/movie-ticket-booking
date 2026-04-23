import React, { useEffect, useState } from "react";
import adminApi from "../../api/modules/admin.api.js";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");

function BarChart({ items, labelKey, valueKey, color = "from-red-600 to-red-400" }) {
    if (!items?.length) return <p className="text-gray-600 text-center py-8">Chưa có dữ liệu</p>;
    const max = Math.max(...items.map((i) => i[valueKey])) || 1;
    return (
        <div className="space-y-3">
            {items.map((item, idx) => {
                const pct = Math.round((item[valueKey] / max) * 100);
                return (
                    <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300 truncate max-w-[55%]">{item[labelKey]}</span>
                            <span className="text-white font-medium shrink-0 ml-2">{fmt(item[valueKey])}đ</span>
                        </div>
                        <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function MonthChart({ data }) {
    if (!data?.length) return <p className="text-gray-600 text-center py-8">Chưa có dữ liệu</p>;
    const max = Math.max(...data.map((d) => d.revenue)) || 1;
    return (
        <div className="flex items-end gap-1 h-48 pt-4">
            {data.map((item, idx) => {
                const heightPct = Math.max(4, Math.round((item.revenue / max) * 100));
                const label = item.month.slice(5); // MM
                return (
                    <div key={idx} className="flex flex-col items-center flex-1 gap-1 group">
                        <div className="relative w-full flex justify-center">
                            <div
                                title={`${item.month}: ${fmt(item.revenue)}đ`}
                                className="w-full max-w-[32px] bg-gradient-to-t from-red-600 to-red-400 rounded-t-sm transition-all duration-300 hover:from-red-500 hover:to-red-300 cursor-pointer"
                                style={{ height: `${heightPct * 1.5}px` }}
                            />
                            {item.revenue > 0 && (
                                <span className="absolute -top-5 text-[10px] text-gray-400 whitespace-nowrap hidden group-hover:block">
                                    {fmt(item.revenue)}đ
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] text-gray-500">{label}</span>
                    </div>
                );
            })}
        </div>
    );
}

function exportCSV(data) {
    if (!data) return;
    const rows = [
        ["Loại", "Tên", "Doanh thu (VNĐ)"],
        ...(data.byMovie || []).map((r) => ["Phim", r.name, r.revenue]),
        ...(data.byTheater || []).map((r) => ["Rạp", r.name, r.revenue]),
        ...(data.byMonth || []).map((r) => ["Tháng", r.month, r.revenue]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

const TABS = ["Theo phim", "Theo tháng", "Theo rạp"];

function AdminRevenue() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(0);

    useEffect(() => {
        adminApi.getRevenue()
            .then((res) => setData(res?.data))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Quản lý doanh thu</h2>
                <button
                    onClick={() => exportCSV(data)}
                    disabled={loading || !data}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                    <span>↓</span> Xuất CSV
                </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-5">
                    <p className="text-white/70 text-sm">Tổng doanh thu</p>
                    <p className="text-white text-3xl font-bold mt-1">
                        {loading ? "—" : `${fmt(data?.totalRevenue)}đ`}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-5">
                    <p className="text-white/70 text-sm">Lượt đặt vé thành công</p>
                    <p className="text-white text-3xl font-bold mt-1">
                        {loading ? "—" : (data?.totalPaidBookings || 0)}
                    </p>
                </div>
            </div>

            {/* Chart tabs */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                {/* Tab bar */}
                <div className="flex gap-1 mb-6 border-b border-gray-800 pb-3">
                    {TABS.map((t, i) => (
                        <button
                            key={t}
                            onClick={() => setTab(i)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                                tab === i
                                    ? "bg-red-500 text-white"
                                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-3 bg-gray-800 rounded w-1/3 mb-2" />
                                <div className="h-6 bg-gray-800 rounded" />
                            </div>
                        ))}
                    </div>
                ) : tab === 0 ? (
                    <BarChart items={data?.byMovie} labelKey="name" valueKey="revenue" color="from-red-600 to-red-400" />
                ) : tab === 1 ? (
                    <div>
                        <p className="text-gray-400 text-xs mb-3">Doanh thu 12 tháng gần nhất</p>
                        <MonthChart data={data?.byMonth} />
                    </div>
                ) : (
                    <BarChart items={data?.byTheater} labelKey="name" valueKey="revenue" color="from-blue-600 to-blue-400" />
                )}
            </div>
        </div>
    );
}

export default AdminRevenue;

import React, { useEffect, useState } from "react";
import adminApi from "../../api/modules/admin.api.js";

function AdminRevenue() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminApi.getRevenue()
            .then((res) => setData(res?.data))
            .finally(() => setLoading(false));
    }, []);

    const maxRevenue = data?.byMovie?.[0]?.revenue || 1;

    return (
        <div className="space-y-6">
            <h2 className="text-white font-bold text-lg">Quản lý doanh thu</h2>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-5">
                    <p className="text-white/70 text-sm">Tổng doanh thu</p>
                    <p className="text-white text-3xl font-bold mt-1">
                        {loading ? "—" : (data?.totalRevenue || 0).toLocaleString("vi-VN")}đ
                    </p>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-5">
                    <p className="text-white/70 text-sm">Lượt đặt vé thành công</p>
                    <p className="text-white text-3xl font-bold mt-1">
                        {loading ? "—" : data?.totalPaidBookings || 0}
                    </p>
                </div>
            </div>

            {/* Revenue by movie */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <h3 className="text-white font-semibold mb-5">Doanh thu theo phim</h3>
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-3 bg-gray-800 rounded w-1/3 mb-2" />
                                <div className="h-6 bg-gray-800 rounded" />
                            </div>
                        ))}
                    </div>
                ) : !data?.byMovie?.length ? (
                    <p className="text-gray-600 text-center py-8">Chưa có dữ liệu doanh thu</p>
                ) : (
                    <div className="space-y-4">
                        {data.byMovie.map((item, idx) => {
                            const pct = Math.round((item.revenue / maxRevenue) * 100);
                            return (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300 truncate max-w-[200px]">{item.name}</span>
                                        <span className="text-white font-medium shrink-0 ml-4">
                                            {item.revenue.toLocaleString("vi-VN")}đ
                                        </span>
                                    </div>
                                    <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminRevenue;

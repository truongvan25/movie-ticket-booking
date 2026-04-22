import React, { useEffect, useState } from "react";
import adminApi from "../../api/modules/admin.api.js";

function AdminTheaters() {
    const [theaters, setTheaters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        adminApi.getTheaters()
            .then((res) => setTheaters(res?.data || []))
            .finally(() => setLoading(false));
    }, []);

    const filtered = theaters.filter((t) =>
        t.theaterName?.toLowerCase().includes(search.toLowerCase()) ||
        t.location?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Quản lý rạp phim</h2>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm rạp hoặc địa chỉ..."
                    className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-lg px-3 py-2 w-60 focus:outline-none focus:border-red-500"
                />
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 border-b border-gray-800">
                                <th className="text-left px-4 py-3 font-medium">Rạp phim</th>
                                <th className="text-left px-4 py-3 font-medium">Hệ thống</th>
                                <th className="text-left px-4 py-3 font-medium">Quản lý</th>
                                <th className="text-left px-4 py-3 font-medium">Địa chỉ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i} className="border-b border-gray-800/50">
                                        {[...Array(4)].map((_, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-10 text-center text-gray-600">
                                        Không có rạp phim nào
                                    </td>
                                </tr>
                            ) : filtered.map((theater) => (
                                <tr key={theater._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                                    <td className="px-4 py-3">
                                        <p className="text-white font-medium">{theater.theaterName}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="bg-blue-500/20 text-blue-400 text-xs px-2.5 py-1 rounded-full font-medium">
                                            {theater.theaterSystemId?.code || "—"}
                                        </span>
                                        <p className="text-gray-500 text-xs mt-0.5">{theater.theaterSystemId?.name}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-gray-300">{theater.managerId?.userName || "—"}</p>
                                        <p className="text-gray-500 text-xs">{theater.managerId?.email}</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 max-w-[250px]">
                                        {theater.location}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-gray-800 text-gray-500 text-xs">
                    {filtered.length} rạp phim
                </div>
            </div>
        </div>
    );
}

export default AdminTheaters;

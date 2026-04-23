import React, { useEffect, useState, useCallback } from "react";
import adminApi from "../../api/modules/admin.api.js";
import Pagination from "../../components/common/Pagination.jsx";

const LIMIT = 20;

const ROLE_OPTIONS = [
    { value: "", label: "Tất cả" },
    { value: "customer", label: "Customer" },
    { value: "theater-manager", label: "Manager" },
    { value: "admin", label: "Admin" },
];

const ROLE_STYLE = {
    admin:             "bg-red-500/20 text-red-400",
    "theater-manager": "bg-purple-500/20 text-purple-400",
    customer:          "bg-blue-500/20 text-blue-400",
};

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [saving, setSaving] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminApi.getUsers({ role: roleFilter, search, page, limit: LIMIT });
            const d = res?.data || {};
            setUsers(d.items || []);
            setTotal(d.total || 0);
            setTotalPages(d.totalPages || 1);
        } finally {
            setLoading(false);
        }
    }, [roleFilter, search, page]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);
    useEffect(() => { setPage(1); }, [roleFilter, search]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    };

    const toggleDeleted = async (user) => {
        if (!window.confirm(`${user.isDeleted ? "Khôi phục" : "Vô hiệu hóa"} tài khoản "${user.userName}"?`)) return;
        setSaving(user._id);
        try {
            await adminApi.updateUser(user._id, { isDeleted: !user.isDeleted });
            setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isDeleted: !u.isDeleted } : u));
        } catch { alert("Thao tác thất bại!"); }
        finally { setSaving(null); }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Xóa vĩnh viễn tài khoản "${user.userName}"?`)) return;
        try {
            await adminApi.deleteUser(user._id);
            setUsers((prev) => prev.filter((u) => u._id !== user._id));
        } catch { alert("Xóa thất bại!"); }
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <h2 className="text-white font-bold text-lg">Quản lý người dùng</h2>
                <div className="flex gap-2 flex-wrap">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                    >
                        {ROLE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Tìm tên hoặc email..."
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
                            <tr className="text-gray-500 border-b border-gray-800">
                                <th className="text-left px-4 py-3 font-medium">Người dùng</th>
                                <th className="text-left px-4 py-3 font-medium">Role</th>
                                <th className="text-left px-4 py-3 font-medium">Xác thực</th>
                                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                                <th className="text-left px-4 py-3 font-medium">Ngày tạo</th>
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
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-gray-600">
                                        Không có người dùng nào
                                    </td>
                                </tr>
                            ) : users.map((user) => (
                                <tr key={user._id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition ${user.isDeleted ? "opacity-50" : ""}`}>
                                    <td className="px-4 py-3">
                                        <p className="text-white font-medium">{user.userName}</p>
                                        <p className="text-gray-500 text-xs">{user.email}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_STYLE[user.role] || ""}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded ${user.isVerified ? "text-green-400" : "text-gray-500"}`}>
                                            {user.isVerified ? "✓ Đã xác thực" : "Chưa xác thực"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded ${user.isDeleted ? "text-red-400" : "text-green-400"}`}>
                                            {user.isDeleted ? "Đã xóa" : "Hoạt động"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleDeleted(user)}
                                                disabled={saving === user._id}
                                                className={`text-xs px-2.5 py-1 rounded border transition ${
                                                    user.isDeleted
                                                        ? "border-green-400/30 text-green-400 hover:border-green-400"
                                                        : "border-yellow-400/30 text-yellow-400 hover:border-yellow-400"
                                                }`}
                                            >
                                                {user.isDeleted ? "Khôi phục" : "Vô hiệu"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user)}
                                                className="text-xs px-2.5 py-1 rounded border border-red-400/30 text-red-400 hover:border-red-400 transition"
                                            >
                                                Xóa
                                            </button>
                                        </div>
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

export default AdminUsers;

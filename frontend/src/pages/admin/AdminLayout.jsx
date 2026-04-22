import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/features/auth.slice.js";
import { ADMIN_PATH } from "../../routes/path.js";

const NAV_ITEMS = [
    { label: "Dashboard",     to: `/admin/${ADMIN_PATH.DASHBOARD}`,  icon: "📊" },
    { label: "Phim",          to: `/admin/${ADMIN_PATH.MOVIES}`,      icon: "🎬" },
    { label: "Rạp phim",      to: `/admin/${ADMIN_PATH.THEATERS}`,    icon: "🏢" },
    { label: "Người dùng",    to: `/admin/${ADMIN_PATH.USERS}`,       icon: "👥" },
    { label: "Đặt vé",        to: `/admin/${ADMIN_PATH.BOOKINGS}`,    icon: "🎫" },
    { label: "Doanh thu",     to: `/admin/${ADMIN_PATH.REVENUE}`,     icon: "💰" },
];

const AdminLayout = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-gray-950 overflow-hidden">
            {/* Sidebar */}
            <aside className={`${collapsed ? "w-16" : "w-60"} bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-200 shrink-0`}>
                {/* Logo */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
                    {!collapsed && (
                        <div>
                            <span className="text-white font-bold text-lg">
                                🎬 Cine<span className="text-red-500">Book</span>
                            </span>
                            <p className="text-gray-500 text-xs mt-0.5">Admin Panel</p>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-gray-400 hover:text-white p-1 rounded transition"
                    >
                        {collapsed ? "→" : "←"}
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const active = location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                title={collapsed ? item.label : ""}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                                    active
                                        ? "bg-red-500 text-white"
                                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                }`}
                            >
                                <span className="text-base shrink-0">{item.icon}</span>
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User + Logout */}
                <div className="border-t border-gray-800 px-3 py-3">
                    {!collapsed && (
                        <div className="mb-2 px-1">
                            <p className="text-white text-xs font-semibold truncate">{user?.userName}</p>
                            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                        </div>
                    )}
                    <button
                        onClick={() => dispatch(logout())}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition"
                    >
                        <span>🚪</span>
                        {!collapsed && <span>Đăng xuất</span>}
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between shrink-0">
                    <h2 className="text-white font-semibold text-sm">
                        {NAV_ITEMS.find((n) => location.pathname === n.to)?.label ?? "Admin"}
                    </h2>
                    <span className="text-xs text-gray-500 bg-red-500/10 text-red-400 px-2 py-1 rounded-full font-medium">
                        Admin
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-gray-950 p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;

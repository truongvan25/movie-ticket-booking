import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/features/auth.slice.js";

const navItems = [
  { label: "Dashboard",   to: "/manager/dashboard", icon: "📊" },
  { label: "Phim",        to: "/manager/movies",    icon: "🎬" },
  { label: "Lịch chiếu",  to: "/manager/shows",     icon: "📅" },
  { label: "Phòng chiếu", to: "/manager/rooms",     icon: "🪑" },
  { label: "Đặt vé",      to: "/manager/bookings",  icon: "🎫" },
];

const ManagerLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <aside className="w-60 bg-gray-900 border-r border-gray-800 text-white flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-gray-800">
          <span className="text-white font-bold text-lg">
            🎬 Cine<span className="text-red-500">Book</span>
          </span>
          <p className="text-gray-500 text-xs mt-0.5">Theater Manager</p>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                location.pathname === item.to
                  ? "bg-red-500 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-700 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
          >
            <span>🏠</span> Trang chủ
          </Link>
          <button
            onClick={() => dispatch(logout())}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-950 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout;

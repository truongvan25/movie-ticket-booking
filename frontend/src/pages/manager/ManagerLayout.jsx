import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/features/auth.slice.js";

const navItems = [
  { label: "Dashboard", to: "/manager/dashboard" },
  { label: "Phim", to: "/manager/movies" },
  { label: "Lịch chiếu", to: "/manager/shows" },
  { label: "Phòng chiếu", to: "/manager/rooms" },
  { label: "Vé", to: "/manager/tickets" },
];

const ManagerLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-gray-700">
          <h1 className="text-lg font-bold text-white">
            🎬 Cine<span className="text-red-400">Book</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">Theater Manager</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition ${
                location.pathname === item.to
                  ? "bg-red-500 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <button
            onClick={() => dispatch(logout())}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm transition"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout;

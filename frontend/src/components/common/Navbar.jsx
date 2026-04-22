import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/features/auth.slice";
import { PATH } from "../../routes/path";

function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Đang chiếu", to: `/${PATH.ONGOING}` },
    { label: "Sắp chiếu", to: `/${PATH.COMING_SOON}` },
  ];

  const isActive = (to) => location.pathname === to;

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={PATH.HOME} className="flex items-center gap-2">
            <span className="text-red-500 text-2xl">🎬</span>
            <span className="text-white text-xl font-bold tracking-wide">
              Cine<span className="text-red-500">Book</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(link.to)
                    ? "bg-red-500 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">
                  Xin chào, <span className="text-white font-medium">{user?.userName || "Khách"}</span>
                </span>
                <button
                  onClick={() => dispatch(logout())}
                  className="border border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-400 px-4 py-1.5 rounded-lg text-sm transition"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <Link
                  to={`/auth/${PATH.SIGNIN}`}
                  className="border border-red-500 text-red-400 hover:bg-red-500 hover:text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to={`/auth/${PATH.SIGNUP}`}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-300 hover:text-white p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive(link.to)
                  ? "bg-red-500 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => { dispatch(logout()); setMenuOpen(false); }}
                className="text-left text-red-400 px-4 py-2 text-sm"
              >
                Đăng xuất
              </button>
            ) : (
              <>
                <Link to={`/auth/${PATH.SIGNIN}`} onClick={() => setMenuOpen(false)} className="block text-center border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm">
                  Đăng nhập
                </Link>
                <Link to={`/auth/${PATH.SIGNUP}`} onClick={() => setMenuOpen(false)} className="block text-center bg-red-500 text-white px-4 py-2 rounded-lg text-sm">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

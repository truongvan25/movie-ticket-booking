import React from "react";
import { Link } from "react-router-dom";
import { PATH } from "../../routes/path";

function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-red-500 text-xl">🎬</span>
            <span className="text-white text-lg font-bold">
              Cine<span className="text-red-500">Book</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed">
            Hệ thống đặt vé xem phim trực tuyến tiện lợi, nhanh chóng và dễ sử dụng.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Khám phá</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to={`/${PATH.ONGOING}`} className="hover:text-red-400 transition">Phim đang chiếu</Link></li>
            <li><Link to={`/${PATH.COMING_SOON}`} className="hover:text-red-400 transition">Phim sắp chiếu</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Tài khoản</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to={`/auth/${PATH.SIGNIN}`} className="hover:text-red-400 transition">Đăng nhập</Link></li>
            <li><Link to={`/auth/${PATH.SIGNUP}`} className="hover:text-red-400 transition">Đăng ký</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-600">
        © {new Date().getFullYear()} CineBook. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;

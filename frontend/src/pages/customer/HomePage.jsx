import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import movieApi from "../../api/modules/movie.api";
import { PATH } from "../../routes/path";

const HERO_SLIDES = [
  {
    title: "Đặt vé xem phim dễ dàng",
    subtitle: "Tìm kiếm và đặt vé cho các bộ phim yêu thích ngay hôm nay",
    gradient: "from-red-900 via-gray-900 to-gray-950",
    cta: "Khám phá phim",
    target: `/${PATH.ONGOING}`,
  },
  {
    title: "Phim hè đang chiếu",
    subtitle: "Hàng trăm bộ phim đang chiếu tại các rạp trên toàn quốc",
    gradient: "from-blue-900 via-gray-900 to-gray-950",
    cta: "Xem ngay",
    target: `/${PATH.ONGOING}`,
  },
  {
    title: "Trải nghiệm điện ảnh đỉnh cao",
    subtitle: "Chọn chỗ ngồi yêu thích và tận hưởng những khoảnh khắc tuyệt vời",
    gradient: "from-purple-900 via-gray-900 to-gray-950",
    cta: "Đặt vé ngay",
    target: `/${PATH.COMING_SOON}`,
  },
];

function MovieCard({ movie, onBook, onDetail }) {
  return (
    <div
      onClick={() => onDetail(movie._id)}
      className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer group hover:ring-2 hover:ring-red-500 transition-all duration-300"
    >
      <div className="relative h-64 bg-gray-700">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.movieName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-2">
            <span className="text-5xl">🎬</span>
            <span className="text-xs">Chưa có poster</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {movie.movieRating && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
            ⭐ {movie.movieRating}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onBook(movie._id); }}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold transition"
          >
            Đặt vé ngay
          </button>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm truncate">{movie.movieName}</h3>
        <p className="text-gray-400 text-xs mt-1 truncate">
          {Array.isArray(movie.genres) ? movie.genres.join(", ") : movie.genres}
          {movie.duration && ` • ${movie.duration} phút`}
        </p>
      </div>
    </div>
  );
}

function MovieSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-gray-800 rounded-xl overflow-hidden animate-pulse">
          <div className="h-64 bg-gray-700" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-4/5" />
            <div className="h-3 bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-600">
      <span className="text-6xl mb-4">{icon}</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}

function SectionHeader({ title, onViewAll }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-3">
        <span className="block w-1 h-6 bg-red-500 rounded-full" />
        {title}
      </h2>
      <button
        onClick={onViewAll}
        className="text-red-400 hover:text-red-300 text-sm font-medium transition flex items-center gap-1"
      >
        Xem tất cả
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [ongoingMovies, setOngoingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const [ongoing, comingSoon] = await Promise.allSettled([
          movieApi.getOngoing(),
          movieApi.getComingSoon(),
        ]);
        setOngoingMovies(ongoing.status === "fulfilled" ? (ongoing.value?.data || []) : []);
        setComingSoonMovies(comingSoon.status === "fulfilled" ? (comingSoon.value?.data || []) : []);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const handleBook = (movieId) => navigate(`/${PATH.BOOKING}/${movieId}`);
  const handleDetail = (movieId) => navigate(`/${PATH.MOVIE_DETAILS}/${movieId}`);

  return (
    <div className="bg-gray-950 text-white">
      {/* Hero Banner */}
      <div className="relative">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          loop
          className="hero-swiper"
        >
          {HERO_SLIDES.map((slide, idx) => (
            <SwiperSlide key={idx}>
              <div
                className={`h-[480px] md:h-[560px] bg-gradient-to-br ${slide.gradient} flex items-center justify-center`}
              >
                <div className="text-center px-6 max-w-2xl mx-auto">
                  <p className="text-red-400 text-sm font-semibold uppercase tracking-widest mb-4">
                    CineBook — Đặt vé trực tuyến
                  </p>
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-gray-300 text-base md:text-lg mb-8">
                    {slide.subtitle}
                  </p>
                  <button
                    onClick={() => navigate(slide.target)}
                    className="bg-red-500 hover:bg-red-600 active:scale-95 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg shadow-red-500/30"
                  >
                    {slide.cta}
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Now Showing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader
          title="Đang chiếu"
          onViewAll={() => navigate(`/${PATH.ONGOING}`)}
        />
        {loading ? (
          <MovieSkeleton />
        ) : ongoingMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {ongoingMovies.slice(0, 10).map((movie) => (
              <MovieCard
                key={movie._id}
                movie={movie}
                onBook={handleBook}
                onDetail={handleDetail}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon="🎬" message="Chưa có phim đang chiếu" />
        )}
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gray-800" />
      </div>

      {/* Coming Soon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader
          title="Sắp chiếu"
          onViewAll={() => navigate(`/${PATH.COMING_SOON}`)}
        />
        {loading ? (
          <MovieSkeleton />
        ) : comingSoonMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {comingSoonMovies.slice(0, 10).map((movie) => (
              <MovieCard
                key={movie._id}
                movie={movie}
                onBook={handleBook}
                onDetail={handleDetail}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon="🎞️" message="Chưa có phim sắp chiếu" />
        )}
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-red-900/40 to-gray-900 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Chưa có tài khoản?
          </h2>
          <p className="text-gray-400 mb-6">
            Đăng ký ngay để đặt vé, lưu phim yêu thích và nhận ưu đãi độc quyền.
          </p>
          <button
            onClick={() => navigate(`/auth/${PATH.SIGNUP}`)}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg shadow-red-500/20"
          >
            Đăng ký miễn phí
          </button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import movieApi from "../../api/modules/movie.api";
import customerApi from "../../api/modules/customer.api.js";
import { PATH } from "../../routes/path";

function MovieCard({ movie, onBook, onDetail, favoriteIds, onToggleFav }) {
    const isFav = favoriteIds?.includes(movie._id);
    return (
        <div
            onClick={() => onDetail(movie._id)}
            className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer group hover:ring-2 hover:ring-red-500 transition-all duration-300"
        >
            <div className="relative h-72 bg-gray-700">
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
                {movie.ageRating && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">
                        {movie.ageRating}
                    </div>
                )}
                {onToggleFav && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleFav(movie._id); }}
                        title={isFav ? "Bỏ yêu thích" : "Thêm yêu thích"}
                        className={`absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full text-sm transition ${
                            isFav ? "bg-red-500 text-white" : "bg-black/40 text-gray-300 hover:text-red-400"
                        }`}
                    >
                        ♥
                    </button>
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
                <h3 className="text-white font-semibold truncate">{movie.movieName}</h3>
                <p className="text-gray-400 text-xs mt-1 truncate">
                    {Array.isArray(movie.genres) ? movie.genres.join(", ") : movie.genres}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">{movie.duration} phút</p>
            </div>
        </div>
    );
}

function Skeleton() {
    return (
        <div className="bg-gray-800 rounded-xl overflow-hidden animate-pulse">
            <div className="h-72 bg-gray-700" />
            <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-4/5" />
                <div className="h-3 bg-gray-700 rounded w-1/2" />
            </div>
        </div>
    );
}

function Movies() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { isAuthenticated } = useSelector((s) => s.auth);
    const isOngoing = location.pathname === `/${PATH.ONGOING}`;

    const initialSearch = searchParams.get("search") || "";
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(initialSearch);
    const [searchInput, setSearchInput] = useState(initialSearch);
    const [favoriteIds, setFavoriteIds] = useState([]);

    useEffect(() => {
        const q = searchParams.get("search") || "";
        setMovies([]);
        setSearch(q);
        setSearchInput(q);
    }, [location.pathname, location.search]);

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
                const status = isOngoing ? "ongoing" : "coming-soon";
                const result = await movieApi.getMovies(status, search);
                setMovies(result?.data || []);
            } catch {
                setMovies([]);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, [isOngoing, search]);

    useEffect(() => {
        if (!isAuthenticated) { setFavoriteIds([]); return; }
        customerApi.getMyFavorites().then((res) =>
            setFavoriteIds((res?.data || []).map((m) => m._id || m))
        );
    }, [isAuthenticated]);

    const handleToggleFav = async (movieId) => {
        if (!isAuthenticated) { navigate(`/auth/${PATH.SIGNIN}`); return; }
        await customerApi.toggleFavorite(movieId);
        setFavoriteIds((prev) =>
            prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput.trim());
    };

    const handleBook = (movieId) => navigate(`/${PATH.BOOKING}/${movieId}`);
    const handleDetail = (movieId) => navigate(`/${PATH.MOVIE_DETAILS}/${movieId}`);

    return (
        <div className="bg-gray-950 min-h-screen text-white">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                                <span className="block w-1 h-7 bg-red-500 rounded-full" />
                                {isOngoing ? "Phim đang chiếu" : "Phim sắp chiếu"}
                            </h1>
                            {!loading && (
                                <p className="text-gray-400 text-sm mt-1 ml-4">
                                    {movies.length} bộ phim
                                </p>
                            )}
                        </div>

                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Tìm kiếm phim..."
                                className="flex-1 sm:w-64 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-red-500 transition"
                            />
                            <button
                                type="submit"
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                            >
                                Tìm
                            </button>
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => { setSearch(""); setSearchInput(""); }}
                                    className="border border-gray-600 text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm transition"
                                >
                                    ✕
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[...Array(10)].map((_, i) => <Skeleton key={i} />)}
                    </div>
                ) : movies.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {movies.map((movie) => (
                            <MovieCard
                                key={movie._id}
                                movie={movie}
                                onBook={handleBook}
                                onDetail={handleDetail}
                                favoriteIds={favoriteIds}
                                onToggleFav={handleToggleFav}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-600">
                        <span className="text-6xl mb-4">🎬</span>
                        <p className="text-lg font-medium text-gray-500">
                            {search ? `Không tìm thấy phim "${search}"` : "Chưa có phim nào"}
                        </p>
                        {search && (
                            <button
                                onClick={() => { setSearch(""); setSearchInput(""); }}
                                className="mt-4 text-red-400 hover:text-red-300 text-sm transition"
                            >
                                Xóa tìm kiếm
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Movies;

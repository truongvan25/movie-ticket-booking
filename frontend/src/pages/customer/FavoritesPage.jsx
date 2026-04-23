import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import customerApi from "../../api/modules/customer.api.js";
import { PATH } from "../../routes/path.js";

function FavoritesPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((s) => s.auth);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) { navigate(`/auth/${PATH.SIGNIN}`); return; }
        customerApi.getMyFavorites()
            .then((res) => setMovies(res?.data || []))
            .finally(() => setLoading(false));
    }, [isAuthenticated]);

    const handleRemove = async (movieId) => {
        await customerApi.toggleFavorite(movieId);
        setMovies((prev) => prev.filter((m) => m._id !== movieId));
    };

    return (
        <div className="bg-gray-950 min-h-screen text-white">
            <div className="bg-gray-900 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="block w-1 h-7 bg-red-500 rounded-full" />
                        Phim yêu thích
                    </h1>
                    {!loading && (
                        <p className="text-gray-400 text-sm mt-1 ml-4">{movies.length} bộ phim</p>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
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
                ) : movies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-600">
                        <span className="text-6xl mb-4">❤️</span>
                        <p className="text-lg font-medium text-gray-500">Chưa có phim yêu thích</p>
                        <button
                            onClick={() => navigate(`/${PATH.ONGOING}`)}
                            className="mt-4 text-red-400 hover:text-red-300 text-sm transition"
                        >
                            Khám phá phim ngay
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {movies.map((movie) => (
                            <div
                                key={movie._id}
                                className="bg-gray-800 rounded-xl overflow-hidden group hover:ring-2 hover:ring-red-500 transition-all duration-300"
                            >
                                <div
                                    className="relative h-64 bg-gray-700 cursor-pointer"
                                    onClick={() => navigate(`/${PATH.MOVIE_DETAILS}/${movie._id}`)}
                                >
                                    {movie.poster ? (
                                        <img
                                            src={movie.poster}
                                            alt={movie.movieName}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-5xl">🎬</div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemove(movie._id); }}
                                        title="Bỏ yêu thích"
                                        className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-xl bg-black/40 rounded-full w-8 h-8 flex items-center justify-center transition"
                                    >
                                        ♥
                                    </button>
                                </div>
                                <div className="p-3">
                                    <h3 className="text-white font-semibold text-sm truncate">{movie.movieName}</h3>
                                    <p className="text-gray-400 text-xs mt-1 truncate">
                                        {Array.isArray(movie.genres) ? movie.genres.join(", ") : movie.genres}
                                        {movie.duration && ` • ${movie.duration} phút`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FavoritesPage;

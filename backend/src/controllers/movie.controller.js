import Movie from "../models/movie.model.js";
import responseHandler from "../handlers/response.handler.js";

const getMovies = async (req, res) => {
    try {
        const { status, search, genre } = req.query;

        const filter = { isDeleted: false };
        if (status) filter.status = status;
        if (genre) filter.genres = { $in: [genre] };
        if (search) filter.movieName = { $regex: search, $options: "i" };

        const movies = await Movie.find(filter).sort({ releaseDate: -1 });
        return responseHandler.ok(res, movies);
    } catch (err) {
        console.error("Lỗi lấy danh sách phim:", err);
        responseHandler.error(res);
    }
};

const getMovieById = async (req, res) => {
    try {
        const { movieId } = req.params;
        const movie = await Movie.findOne({ _id: movieId, isDeleted: false });
        if (!movie) return responseHandler.notFound(res, "Không tìm thấy phim.");
        return responseHandler.ok(res, movie);
    } catch (err) {
        console.error("Lỗi lấy thông tin phim:", err);
        responseHandler.error(res);
    }
};

export default { getMovies, getMovieById };

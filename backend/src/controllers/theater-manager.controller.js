import responseHandler from "../handlers/response.handler.js";
import Movie from "../models/movie.model.js";

const addMovie = async (req, res) => {
  try {
    const { movieName, description, genres, duration, releaseDate, poster, ageRating, status } = req.body;

    const newMovie = new Movie({
      movieName,
      description,
      genres,
      duration,
      releaseDate,
      poster,
      ageRating,
      status,
      theaterManagerId: req.user._id,
    });

    await newMovie.save();
    return responseHandler.created(res, { message: "Thêm phim thành công!", movie: newMovie });
  } catch (err) {
    console.error("Lỗi thêm phim:", err);
    responseHandler.error(res);
  }
};

const updateMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { movieName, description, genres, duration, releaseDate, poster, ageRating, status } = req.body;

    const movie = await Movie.findOne({ _id: movieId, isDeleted: false });
    if (!movie) return responseHandler.notFound(res, "Không tìm thấy phim.");

    if (movieName) movie.movieName = movieName;
    if (description) movie.description = description;
    if (genres) movie.genres = genres;
    if (duration) movie.duration = duration;
    if (releaseDate) movie.releaseDate = releaseDate;
    if (poster) movie.poster = poster;
    if (ageRating) movie.ageRating = ageRating;
    if (status) movie.status = status;

    await movie.save();
    return responseHandler.ok(res, { message: "Cập nhật phim thành công!", movie });
  } catch (err) {
    console.error("Lỗi cập nhật phim:", err);
    responseHandler.error(res);
  }
};

// Soft delete — chỉ đánh dấu isDeleted, không xóa khỏi DB
const deleteMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findOne({ _id: movieId, isDeleted: false });
    if (!movie) return responseHandler.notFound(res, "Không tìm thấy phim.");

    movie.isDeleted = true;
    await movie.save();

    return responseHandler.ok(res, { message: "Xóa phim thành công!" });
  } catch (err) {
    console.error("Lỗi xóa phim:", err);
    responseHandler.error(res);
  }
};

export default {
  addMovie,
  updateMovie,
  deleteMovie,
};

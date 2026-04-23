import responseHandler from "../handlers/response.handler.js";
import Movie from "../models/movie.model.js";
import Theater from "../models/theater.model.js";
import Room from "../models/rooms.model.js";
import Show from "../models/show.model.js";
import Booking from "../models/booking.model.js";
import Review from "../models/review.model.js";

// ── helpers ────────────────────────────────────────────────────────────────
const getManagerTheaters = (managerId) =>
    Theater.find({ managerId, isDeleted: false }).select("_id theaterName location");

// ── DASHBOARD ──────────────────────────────────────────────────────────────
const getStats = async (req, res) => {
    try {
        const theaters = await getManagerTheaters(req.user._id);
        const theaterIds = theaters.map((t) => t._id);

        const [totalShows, totalRooms, totalMovies, paidBookings] = await Promise.all([
            Show.countDocuments({ theaterId: { $in: theaterIds } }),
            Room.countDocuments({ theaterId: { $in: theaterIds } }),
            Movie.countDocuments({ theaterManagerId: req.user._id, isDeleted: false }),
            Booking.find({}).populate({
                path: "showId",
                match: { theaterId: { $in: theaterIds } },
                select: "_id",
            }),
        ]);

        const validPaid = paidBookings.filter((b) => b.showId && b.status === "paid");
        const totalRevenue = validPaid.reduce((s, b) => s + b.totalPrice, 0);

        return responseHandler.ok(res, {
            totalTheaters: theaters.length,
            totalShows,
            totalRooms,
            totalMovies,
            totalRevenue,
        });
    } catch (err) {
        console.error(err);
        responseHandler.error(res);
    }
};

// ── THEATERS ───────────────────────────────────────────────────────────────
const getMyTheaters = async (req, res) => {
    try {
        const theaters = await Theater.find({ managerId: req.user._id, isDeleted: false })
            .populate("theaterSystemId", "name code");
        return responseHandler.ok(res, theaters);
    } catch (err) {
        responseHandler.error(res);
    }
};

// ── MOVIES ─────────────────────────────────────────────────────────────────
const getMovies = async (req, res) => {
    try {
        const { status, search } = req.query;
        const filter = { theaterManagerId: req.user._id, isDeleted: false };
        if (status) filter.status = status;
        if (search) filter.movieName = { $regex: search, $options: "i" };
        const movies = await Movie.find(filter).sort({ createdAt: -1 });
        return responseHandler.ok(res, movies);
    } catch (err) {
        responseHandler.error(res);
    }
};

const addMovie = async (req, res) => {
    try {
        const { movieName, description, genres, duration, releaseDate, poster, ageRating, status } = req.body;
        const movie = new Movie({
            movieName, description, genres, duration, releaseDate, poster, ageRating,
            status: status || "coming-soon",
            theaterManagerId: req.user._id,
        });
        await movie.save();
        return responseHandler.created(res, { message: "Thêm phim thành công!", movie });
    } catch (err) {
        console.error(err);
        responseHandler.error(res);
    }
};

const updateMovie = async (req, res) => {
    try {
        const movie = await Movie.findOne({ _id: req.params.movieId, isDeleted: false });
        if (!movie) return responseHandler.notFound(res, "Không tìm thấy phim.");
        const fields = ["movieName", "description", "genres", "duration", "releaseDate", "poster", "ageRating", "status"];
        for (const f of fields) {
            if (req.body[f] !== undefined) movie[f] = req.body[f];
        }
        await movie.save();
        return responseHandler.ok(res, { message: "Cập nhật phim thành công!", movie });
    } catch (err) {
        responseHandler.error(res);
    }
};

const deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findOne({ _id: req.params.movieId, isDeleted: false });
        if (!movie) return responseHandler.notFound(res, "Không tìm thấy phim.");
        movie.isDeleted = true;
        await movie.save();
        return responseHandler.ok(res, { message: "Xóa phim thành công!" });
    } catch (err) {
        responseHandler.error(res);
    }
};

// ── ROOMS ──────────────────────────────────────────────────────────────────
const getRooms = async (req, res) => {
    try {
        const theaters = await getManagerTheaters(req.user._id);
        const theaterIds = theaters.map((t) => t._id);
        const rooms = await Room.find({ theaterId: { $in: theaterIds } })
            .populate("theaterId", "theaterName");
        return responseHandler.ok(res, rooms);
    } catch (err) {
        responseHandler.error(res);
    }
};

const addRoom = async (req, res) => {
    try {
        const { theaterId, roomNumber } = req.body;
        const theater = await Theater.findOne({ _id: theaterId, managerId: req.user._id });
        if (!theater) return responseHandler.forbidden(res, "Bạn không có quyền với rạp này.");
        const room = new Room({ theaterId, roomNumber });
        await room.save();
        return responseHandler.created(res, { message: "Thêm phòng thành công!", room });
    } catch (err) {
        if (err.code === 11000) return responseHandler.badRequest(res, "Phòng này đã tồn tại trong rạp.");
        responseHandler.error(res);
    }
};

const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId).populate("theaterId");
        if (!room) return responseHandler.notFound(res, "Không tìm thấy phòng.");
        if (String(room.theaterId.managerId) !== String(req.user._id))
            return responseHandler.forbidden(res, "Bạn không có quyền xóa phòng này.");
        await room.deleteOne();
        return responseHandler.ok(res, { message: "Xóa phòng thành công!" });
    } catch (err) {
        responseHandler.error(res);
    }
};

// ── SHOWS ──────────────────────────────────────────────────────────────────
const getShows = async (req, res) => {
    try {
        const theaters = await getManagerTheaters(req.user._id);
        const theaterIds = theaters.map((t) => t._id);
        const shows = await Show.find({ theaterId: { $in: theaterIds } })
            .populate("movieId", "movieName poster duration")
            .populate("theaterId", "theaterName")
            .populate("roomId", "roomNumber")
            .sort({ startTime: -1 });
        return responseHandler.ok(res, shows);
    } catch (err) {
        responseHandler.error(res);
    }
};

const addShow = async (req, res) => {
    try {
        const { movieId, theaterId, roomId, startTime, price } = req.body;
        const theater = await Theater.findOne({ _id: theaterId, managerId: req.user._id });
        if (!theater) return responseHandler.forbidden(res, "Bạn không có quyền với rạp này.");
        const movie = await Movie.findById(movieId);
        if (!movie) return responseHandler.notFound(res, "Không tìm thấy phim.");
        const endTime = new Date(new Date(startTime).getTime() + (movie.duration + 15) * 60000);
        const show = new Show({ movieId, theaterId, roomId, startTime, endTime, price: price || 90000 });
        await show.save();
        const populated = await show.populate([
            { path: "movieId", select: "movieName poster duration" },
            { path: "theaterId", select: "theaterName" },
            { path: "roomId", select: "roomNumber" },
        ]);
        return responseHandler.created(res, { message: "Thêm lịch chiếu thành công!", show: populated });
    } catch (err) {
        console.error(err);
        responseHandler.error(res);
    }
};

const updateShow = async (req, res) => {
    try {
        const show = await Show.findById(req.params.showId).populate("theaterId");
        if (!show) return responseHandler.notFound(res, "Không tìm thấy lịch chiếu.");
        if (String(show.theaterId.managerId) !== String(req.user._id))
            return responseHandler.forbidden(res);
        const fields = ["startTime", "endTime", "price", "status", "roomId"];
        for (const f of fields) {
            if (req.body[f] !== undefined) show[f] = req.body[f];
        }
        await show.save();
        return responseHandler.ok(res, { message: "Cập nhật lịch chiếu thành công!", show });
    } catch (err) {
        responseHandler.error(res);
    }
};

const deleteShow = async (req, res) => {
    try {
        const show = await Show.findById(req.params.showId).populate("theaterId");
        if (!show) return responseHandler.notFound(res, "Không tìm thấy lịch chiếu.");
        if (String(show.theaterId.managerId) !== String(req.user._id))
            return responseHandler.forbidden(res);
        await show.deleteOne();
        return responseHandler.ok(res, { message: "Xóa lịch chiếu thành công!" });
    } catch (err) {
        responseHandler.error(res);
    }
};

// ── BOOKINGS ───────────────────────────────────────────────────────────────
const getBookings = async (req, res) => {
    try {
        const theaters = await getManagerTheaters(req.user._id);
        const theaterIds = theaters.map((t) => t._id);
        const shows = await Show.find({ theaterId: { $in: theaterIds } }).select("_id");
        const showIds = shows.map((s) => s._id);

        const { status } = req.query;
        const filter = { showId: { $in: showIds } };
        if (status) filter.status = status;

        const bookings = await Booking.find(filter)
            .populate("userId", "userName email")
            .populate({ path: "showId", populate: { path: "movieId", select: "movieName" } })
            .sort({ createdAt: -1 })
            .limit(200);

        return responseHandler.ok(res, bookings);
    } catch (err) {
        responseHandler.error(res);
    }
};

// ── REVIEWS ────────────────────────────────────────────────────────────────
const getReviews = async (req, res) => {
    try {
        const theaters = await getManagerTheaters(req.user._id);
        const theaterIds = theaters.map((t) => t._id);
        const movieIds = await Movie.find({
            theaterManagerId: req.user._id,
            isDeleted: false,
        }).distinct("_id");

        const { page, limit } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, parseInt(limit) || 20);
        const skip = (pageNum - 1) * limitNum;

        const filter = { movieId: { $in: movieIds } };
        const [reviews, total] = await Promise.all([
            Review.find(filter)
                .populate("userId", "userName email")
                .populate("movieId", "movieName")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Review.countDocuments(filter),
        ]);

        return responseHandler.ok(res, {
            items: reviews,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
        });
    } catch (err) {
        responseHandler.error(res);
    }
};

export default {
    getStats,
    getMyTheaters,
    getMovies, addMovie, updateMovie, deleteMovie,
    getRooms, addRoom, deleteRoom,
    getShows, addShow, updateShow, deleteShow,
    getBookings,
    getReviews,
};

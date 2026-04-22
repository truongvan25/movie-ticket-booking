import User from "../models/user.model.js";
import Movie from "../models/movie.model.js";
import Theater from "../models/theater.model.js";
import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";
import responseHandler from "../handlers/response.handler.js";

const getStats = async (req, res) => {
    try {
        const [totalUsers, totalMovies, totalTheaters, totalShows, paidBookings, allBookings] =
            await Promise.all([
                User.countDocuments({ isDeleted: false }),
                Movie.countDocuments({ isDeleted: false }),
                Theater.countDocuments({ isDeleted: false }),
                Show.countDocuments({}),
                Booking.find({ status: "paid" }).select("totalPrice"),
                Booking.countDocuments({}),
            ]);

        const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalPrice, 0);

        return responseHandler.ok(res, {
            totalUsers,
            totalMovies,
            totalTheaters,
            totalShows,
            totalBookings: allBookings,
            totalRevenue,
        });
    } catch (err) {
        console.error(err);
        responseHandler.error(res);
    }
};

const getUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (search)
            filter.$or = [
                { userName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];

        const users = await User.find(filter)
            .select("-password -verifyKey -resetToken -verifyKeyExpires -resetTokenExpires")
            .sort({ createdAt: -1 });

        return responseHandler.ok(res, users);
    } catch (err) {
        console.error(err);
        responseHandler.error(res);
    }
};

const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role, isDeleted, isVerified } = req.body;

        const user = await User.findById(userId);
        if (!user) return responseHandler.notFound(res, "Không tìm thấy người dùng.");

        if (role) user.role = role;
        if (typeof isDeleted === "boolean") user.isDeleted = isDeleted;
        if (typeof isVerified === "boolean") user.isVerified = isVerified;

        await user.save();
        return responseHandler.ok(res, { message: "Cập nhật thành công!", user });
    } catch (err) {
        console.error(err);
        responseHandler.error(res);
    }
};

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) return responseHandler.notFound(res, "Không tìm thấy người dùng.");

        user.isDeleted = true;
        await user.save();
        return responseHandler.ok(res, { message: "Đã xóa người dùng!" });
    } catch (err) {
        console.error(err);
        responseHandler.error(res);
    }
};

const getMovies = async (req, res) => {
    try {
        const { status, search } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (search) filter.movieName = { $regex: search, $options: "i" };

        const movies = await Movie.find(filter).sort({ createdAt: -1 });
        return responseHandler.ok(res, movies);
    } catch (err) {
        console.error(err);
        responseHandler.error(res);
    }
};

const updateMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        const movie = await Movie.findById(movieId);
        if (!movie) return responseHandler.notFound(res, "Không tìm thấy phim.");

        const fields = ["movieName", "status", "ageRating", "genres", "duration", "releaseDate", "poster", "description", "isDeleted"];
        for (const field of fields) {
            if (req.body[field] !== undefined) movie[field] = req.body[field];
        }

        await movie.save();
        return responseHandler.ok(res, { message: "Cập nhật phim thành công!", movie });
    } catch (err) {
        console.error(err);
        responseHandler.error(res);
    }
};

const deleteMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        const movie = await Movie.findById(movieId);
        if (!movie) return responseHandler.notFound(res, "Không tìm thấy phim.");

        movie.isDeleted = true;
        await movie.save();
        return responseHandler.ok(res, { message: "Đã xóa phim!" });
    } catch (err) {
        console.error(err);
        responseHandler.error(res);
    }
};

const getTheaters = async (req, res) => {
    try {
        const theaters = await Theater.find({ isDeleted: false })
            .populate("managerId", "userName email")
            .populate("theaterSystemId", "name code")
            .sort({ createdAt: -1 });

        return responseHandler.ok(res, theaters);
    } catch (err) {
        console.error(err);
        responseHandler.error(res);
    }
};

const getBookings = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const bookings = await Booking.find(filter)
            .populate("userId", "userName email")
            .populate({ path: "showId", populate: { path: "movieId", select: "movieName poster" } })
            .sort({ createdAt: -1 })
            .limit(200);

        return responseHandler.ok(res, bookings);
    } catch (err) {
        console.error(err);
        responseHandler.error(res);
    }
};

const getRevenue = async (req, res) => {
    try {
        const paidBookings = await Booking.find({ status: "paid" })
            .populate({ path: "showId", populate: { path: "movieId", select: "movieName" } })
            .sort({ createdAt: -1 });

        const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalPrice, 0);

        const byMovie = {};
        for (const booking of paidBookings) {
            const name = booking.showId?.movieId?.movieName || "Khác";
            byMovie[name] = (byMovie[name] || 0) + booking.totalPrice;
        }

        return responseHandler.ok(res, {
            totalRevenue,
            totalPaidBookings: paidBookings.length,
            byMovie: Object.entries(byMovie)
                .map(([name, revenue]) => ({ name, revenue }))
                .sort((a, b) => b.revenue - a.revenue),
        });
    } catch (err) {
        console.error(err);
        responseHandler.error(res);
    }
};

export default {
    getStats,
    getUsers, updateUser, deleteUser,
    getMovies, updateMovie, deleteMovie,
    getTheaters,
    getBookings,
    getRevenue,
};

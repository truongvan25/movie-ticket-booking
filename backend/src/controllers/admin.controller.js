import User from "../models/user.model.js";
import Movie from "../models/movie.model.js";
import Theater from "../models/theater.model.js";
import TheaterSystem from "../models/theaterSystem.model.js";
import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";
import Review from "../models/review.model.js";
import Support from "../models/support.model.js";
import PromoCode from "../models/promoCode.model.js";
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
        const { role, search, page, limit } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (search)
            filter.$or = [
                { userName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, parseInt(limit) || 20);
        const skip = (pageNum - 1) * limitNum;

        const [users, total] = await Promise.all([
            User.find(filter)
                .select("-password -verifyKey -resetToken -verifyKeyExpires -resetTokenExpires")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            User.countDocuments(filter),
        ]);

        return responseHandler.ok(res, {
            items: users,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
        });
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
        const { status, search, page, limit } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (search) filter.movieName = { $regex: search, $options: "i" };

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, parseInt(limit) || 20);
        const skip = (pageNum - 1) * limitNum;

        const [movies, total] = await Promise.all([
            Movie.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            Movie.countDocuments(filter),
        ]);

        return responseHandler.ok(res, {
            items: movies,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
        });
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
            .populate({
                path: "showId",
                populate: [
                    { path: "movieId", select: "movieName" },
                    { path: "theaterId", select: "theaterName" },
                ],
            })
            .sort({ createdAt: -1 });

        const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalPrice, 0);

        const byMovie = {};
        const byTheater = {};
        const byMonthMap = {};

        for (const booking of paidBookings) {
            const name = booking.showId?.movieId?.movieName || "Khác";
            byMovie[name] = (byMovie[name] || 0) + booking.totalPrice;

            const theater = booking.showId?.theaterId?.theaterName || "Khác";
            byTheater[theater] = (byTheater[theater] || 0) + booking.totalPrice;

            const d = new Date(booking.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            byMonthMap[key] = (byMonthMap[key] || 0) + booking.totalPrice;
        }

        // Last 12 months (oldest → newest)
        const now = new Date();
        const byMonth = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            return { month: key, revenue: byMonthMap[key] || 0 };
        });

        return responseHandler.ok(res, {
            totalRevenue,
            totalPaidBookings: paidBookings.length,
            byMovie: Object.entries(byMovie)
                .map(([name, revenue]) => ({ name, revenue }))
                .sort((a, b) => b.revenue - a.revenue),
            byMonth,
            byTheater: Object.entries(byTheater)
                .map(([name, revenue]) => ({ name, revenue }))
                .sort((a, b) => b.revenue - a.revenue),
        });
    } catch (err) {
        console.error(err);
        responseHandler.error(res);
    }
};

// GET /admin/reviews
const getReviews = async (req, res) => {
    try {
        const { movieId, page, limit } = req.query;
        const filter = movieId ? { movieId } : {};

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, parseInt(limit) || 20);
        const skip = (pageNum - 1) * limitNum;

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
        console.error(err);
        responseHandler.error(res);
    }
};

// DELETE /admin/reviews/:reviewId
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.reviewId);
        if (!review) return responseHandler.notFound(res, "Không tìm thấy đánh giá");
        return responseHandler.ok(res, { message: "Đã xóa đánh giá" });
    } catch (err) {
        console.error(err);
        responseHandler.error(res);
    }
};

// GET /admin/support
const getSupport = async (req, res) => {
    try {
        const { status, page, limit } = req.query;
        const filter = status ? { status } : {};

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, parseInt(limit) || 20);
        const skip = (pageNum - 1) * limitNum;

        const [tickets, total] = await Promise.all([
            Support.find(filter)
                .populate("userId", "userName email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Support.countDocuments(filter),
        ]);

        return responseHandler.ok(res, {
            items: tickets,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
        });
    } catch (err) {
        console.error(err);
        responseHandler.error(res);
    }
};

// PUT /admin/support/:ticketId
const replySupport = async (req, res) => {
    try {
        const { reply, status } = req.body;
        const ticket = await Support.findById(req.params.ticketId);
        if (!ticket) return responseHandler.notFound(res, "Không tìm thấy ticket");

        if (reply?.trim()) {
            ticket.adminReply = reply.trim();
            ticket.repliedAt = new Date();
        }
        if (status) ticket.status = status;
        await ticket.save();

        return responseHandler.ok(res, ticket);
    } catch (err) {
        console.error(err);
        responseHandler.error(res);
    }
};

// GET /admin/promo-codes
const getPromoCodes = async (req, res) => {
    try {
        const codes = await PromoCode.find().sort({ createdAt: -1 });
        return responseHandler.ok(res, codes);
    } catch (err) {
        responseHandler.error(res);
    }
};

// POST /admin/promo-codes
const createPromoCode = async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderValue, maxUses, expiresAt } = req.body;
        if (!code || discountValue === undefined)
            return responseHandler.badRequest(res, "Vui lòng nhập đầy đủ thông tin");

        const promo = await PromoCode.create({
            code: code.toUpperCase().trim(),
            discountType: discountType || "percent",
            discountValue: Number(discountValue),
            minOrderValue: Number(minOrderValue) || 0,
            maxUses: maxUses ? Number(maxUses) : null,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
        });
        return responseHandler.created(res, promo);
    } catch (err) {
        if (err.code === 11000) return responseHandler.badRequest(res, "Mã khuyến mãi đã tồn tại");
        responseHandler.error(res);
    }
};

// PUT /admin/promo-codes/:id
const updatePromoCode = async (req, res) => {
    try {
        const promo = await PromoCode.findById(req.params.id);
        if (!promo) return responseHandler.notFound(res, "Không tìm thấy mã");
        const fields = ["discountType", "discountValue", "minOrderValue", "maxUses", "expiresAt", "isActive"];
        for (const f of fields) if (req.body[f] !== undefined) promo[f] = req.body[f];
        await promo.save();
        return responseHandler.ok(res, promo);
    } catch (err) {
        responseHandler.error(res);
    }
};

// DELETE /admin/promo-codes/:id
const deletePromoCode = async (req, res) => {
    try {
        await PromoCode.findByIdAndDelete(req.params.id);
        return responseHandler.ok(res, { message: "Đã xóa mã" });
    } catch (err) {
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
    getReviews, deleteReview,
    getSupport, replySupport,
    getPromoCodes, createPromoCode, updatePromoCode, deletePromoCode,
};

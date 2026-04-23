import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Show from "../models/show.model.js";
import Seat from "../models/seat.model.js";
import Booking from "../models/booking.model.js";
import Ticket from "../models/ticket.model.js";
import Review from "../models/review.model.js";
import Movie from "../models/movie.model.js";
import Theater from "../models/theater.model.js";
import Room from "../models/rooms.model.js";
import User from "../models/user.model.js";
import Support from "../models/support.model.js";
import PromoCode from "../models/promoCode.model.js";
import responseHandler from "../handlers/response.handler.js";

dotenv.config();
const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const transport = smtpConfigured
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    : null;

const sendBookingConfirmation = async (email, userName, booking, tickets, show) => {
    if (!transport) return;
    const movieName = show?.movieId?.movieName || "Phim";
    const theaterName = show?.theaterId?.theaterName || "";
    const showTime = show?.startTime ? new Date(show.startTime).toLocaleString("vi-VN") : "";
    const seatList = tickets.map((t) => t.seatNumber || t.seatId?.seatNumber || "").filter(Boolean).join(", ");
    try {
        await transport.sendMail({
            from: "CineBook <no-reply@cinebook.com>",
            to: email,
            subject: `Xác nhận đặt vé — ${movieName}`,
            html: `
                <h3>Xin chào ${userName}!</h3>
                <p>Đặt vé của bạn đã được xác nhận thành công.</p>
                <table style="border-collapse:collapse;width:100%;max-width:480px">
                    <tr><td style="padding:6px 0;color:#888">Mã đặt vé</td><td><b>${booking._id}</b></td></tr>
                    <tr><td style="padding:6px 0;color:#888">Phim</td><td><b>${movieName}</b></td></tr>
                    <tr><td style="padding:6px 0;color:#888">Rạp</td><td>${theaterName}</td></tr>
                    <tr><td style="padding:6px 0;color:#888">Suất chiếu</td><td>${showTime}</td></tr>
                    <tr><td style="padding:6px 0;color:#888">Ghế</td><td>${seatList}</td></tr>
                    <tr><td style="padding:6px 0;color:#888">Tổng tiền</td><td><b>${booking.totalPrice?.toLocaleString("vi-VN")}đ</b></td></tr>
                </table>
                <p style="margin-top:16px">Cảm ơn bạn đã sử dụng CineBook!</p>
            `,
        });
    } catch (err) {
        console.error("Booking email error:", err.message);
    }
};

// Public: GET /shows?movieId=&theaterId=&date=
const getShows = async (req, res) => {
    try {
        const { movieId, theaterId, date } = req.query;
        const filter = { status: { $ne: "cancelled" } };

        if (movieId) filter.movieId = movieId;
        if (theaterId) filter.theaterId = theaterId;

        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            filter.startTime = { $gte: start, $lte: end };
        } else {
            filter.endTime = { $gte: new Date() };
        }

        const shows = await Show.find(filter)
            .populate("movieId", "movieName poster duration ageRating genres")
            .populate("theaterId", "theaterName location")
            .populate("roomId", "roomNumber")
            .sort("startTime");

        return responseHandler.ok(res, shows);
    } catch (err) {
        console.error("getShows error:", err);
        responseHandler.error(res);
    }
};

// Public: GET /shows/:showId
const getShowById = async (req, res) => {
    try {
        const show = await Show.findById(req.params.showId)
            .populate("movieId", "movieName poster duration ageRating genres description")
            .populate("theaterId", "theaterName location")
            .populate("roomId", "roomNumber");

        if (!show) return responseHandler.notFound(res, "Không tìm thấy suất chiếu");
        return responseHandler.ok(res, show);
    } catch (err) {
        console.error("getShowById error:", err);
        responseHandler.error(res);
    }
};

// Public: GET /shows/:showId/seats
const getShowSeats = async (req, res) => {
    try {
        const { showId } = req.params;
        const show = await Show.findById(showId);
        if (!show) return responseHandler.notFound(res, "Không tìm thấy suất chiếu");

        const seats = await Seat.find({
            roomId: show.roomId,
            isDeleted: false,
            isDisabled: false,
        }).sort("seatNumber");

        const bookedTickets = await Ticket.find({ showId, isDeleted: false });
        const bookedSeatIds = new Set(bookedTickets.map((t) => String(t.seatId)));

        const result = seats.map((s) => ({
            ...s.toObject(),
            isBooked: bookedSeatIds.has(String(s._id)),
        }));

        return responseHandler.ok(res, result);
    } catch (err) {
        console.error("getShowSeats error:", err);
        responseHandler.error(res);
    }
};

// Public: POST /customer/validate-promo
const validatePromo = async (req, res) => {
    try {
        const { code, totalPrice } = req.body;
        if (!code) return responseHandler.badRequest(res, "Vui lòng nhập mã");

        const promo = await PromoCode.findOne({ code: code.toUpperCase().trim(), isActive: true });
        if (!promo) return responseHandler.badRequest(res, "Mã khuyến mãi không hợp lệ");
        if (promo.expiresAt && promo.expiresAt < new Date())
            return responseHandler.badRequest(res, "Mã khuyến mãi đã hết hạn");
        if (promo.maxUses !== null && promo.usedCount >= promo.maxUses)
            return responseHandler.badRequest(res, "Mã khuyến mãi đã hết lượt dùng");
        if (totalPrice < promo.minOrderValue)
            return responseHandler.badRequest(res, `Đơn hàng tối thiểu ${promo.minOrderValue.toLocaleString("vi-VN")}đ`);

        const discount = promo.discountType === "percent"
            ? Math.round(totalPrice * promo.discountValue / 100)
            : promo.discountValue;

        return responseHandler.ok(res, { promo, discount, finalPrice: Math.max(0, totalPrice - discount) });
    } catch (err) {
        responseHandler.error(res);
    }
};

// Protected: POST /customer/bookings
const createBooking = async (req, res) => {
    try {
        const { showId, seatIds, promoCode } = req.body;
        const userId = req.user._id;

        if (!showId || !Array.isArray(seatIds) || seatIds.length === 0) {
            return responseHandler.badRequest(res, "Thiếu thông tin đặt vé");
        }

        const show = await Show.findById(showId);
        if (!show || show.status === "cancelled") {
            return responseHandler.badRequest(res, "Suất chiếu không hợp lệ");
        }
        if (new Date(show.endTime) < new Date()) {
            return responseHandler.badRequest(res, "Suất chiếu đã kết thúc");
        }

        const alreadyBooked = await Ticket.find({
            showId,
            seatId: { $in: seatIds },
            isDeleted: false,
        });
        if (alreadyBooked.length > 0) {
            return responseHandler.badRequest(res, "Một số ghế đã được đặt trước");
        }

        const seats = await Seat.find({
            _id: { $in: seatIds },
            roomId: show.roomId,
            isDeleted: false,
            isDisabled: false,
        });
        if (seats.length !== seatIds.length) {
            return responseHandler.badRequest(res, "Một số ghế không hợp lệ");
        }

        const priceMultiplier = { standard: 1, vip: 1.5, couple: 2 };

        const booking = await Booking.create({
            userId,
            showId,
            totalPrice: 0,
            status: "paid",
        });

        const ticketDocs = seats.map((s) => ({
            bookingId: booking._id,
            ownerId: userId,
            showId,
            seatId: s._id,
            price: Math.round(show.price * (priceMultiplier[s.seatType] || 1)),
        }));
        const tickets = await Ticket.insertMany(ticketDocs);

        const totalPrice = tickets.reduce((sum, t) => sum + t.price, 0);
        let finalPrice = totalPrice;
        let appliedPromo = null;

        if (promoCode) {
            const promo = await PromoCode.findOne({ code: promoCode.toUpperCase().trim(), isActive: true });
            if (promo && !(promo.expiresAt && promo.expiresAt < new Date()) &&
                !(promo.maxUses !== null && promo.usedCount >= promo.maxUses) &&
                totalPrice >= promo.minOrderValue) {
                const discount = promo.discountType === "percent"
                    ? Math.round(totalPrice * promo.discountValue / 100)
                    : promo.discountValue;
                finalPrice = Math.max(0, totalPrice - discount);
                promo.usedCount += 1;
                await promo.save();
                appliedPromo = { code: promo.code, discount };
            }
        }

        booking.tickets = tickets.map((t) => t._id);
        booking.totalPrice = finalPrice;
        await booking.save();

        // Send confirmation email (non-blocking)
        const populatedShow = await Show.findById(showId)
            .populate("movieId", "movieName")
            .populate("theaterId", "theaterName");
        const currentUser = await User.findById(userId).select("email userName");
        sendBookingConfirmation(currentUser.email, currentUser.userName, booking, tickets, populatedShow);

        return responseHandler.created(res, { booking, tickets, appliedPromo });
    } catch (err) {
        console.error("createBooking error:", err);
        responseHandler.error(res);
    }
};

// Protected: GET /customer/bookings
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate({
                path: "showId",
                populate: [
                    { path: "movieId", select: "movieName poster duration" },
                    { path: "theaterId", select: "theaterName" },
                    { path: "roomId", select: "roomNumber" },
                ],
            })
            .populate({
                path: "tickets",
                populate: { path: "seatId", select: "seatNumber seatType" },
            })
            .sort({ createdAt: -1 });

        return responseHandler.ok(res, bookings);
    } catch (err) {
        console.error("getMyBookings error:", err);
        responseHandler.error(res);
    }
};

// Protected: PUT /customer/bookings/:bookingId/cancel
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.bookingId,
            userId: req.user._id,
        }).populate({
            path: "showId",
            select: "startTime",
        });

        if (!booking) return responseHandler.notFound(res, "Không tìm thấy đơn đặt vé");
        if (booking.status === "cancelled") return responseHandler.badRequest(res, "Đơn đã bị hủy");

        const showTime = new Date(booking.showId?.startTime);
        if (showTime && showTime < new Date()) {
            return responseHandler.badRequest(res, "Không thể hủy vé sau khi suất chiếu đã bắt đầu");
        }

        booking.status = "cancelled";
        await booking.save();
        await Ticket.updateMany({ bookingId: booking._id }, { isDeleted: true });

        return responseHandler.ok(res, { message: "Hủy vé thành công" });
    } catch (err) {
        console.error("cancelBooking error:", err);
        responseHandler.error(res);
    }
};

// Protected: GET /customer/tickets
const getMyTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ ownerId: req.user._id, isDeleted: false })
            .populate({
                path: "showId",
                populate: [
                    { path: "movieId", select: "movieName poster ageRating" },
                    { path: "theaterId", select: "theaterName location" },
                    { path: "roomId", select: "roomNumber" },
                ],
            })
            .populate("seatId", "seatNumber seatType")
            .populate("bookingId", "status totalPrice createdAt")
            .sort({ createdAt: -1 });

        return responseHandler.ok(res, tickets);
    } catch (err) {
        console.error("getMyTickets error:", err);
        responseHandler.error(res);
    }
};

// Protected: POST /customer/reviews
const addReview = async (req, res) => {
    try {
        const { movieId, rating, comment } = req.body;
        const userId = req.user._id;

        if (!movieId || !rating || !comment?.trim()) {
            return responseHandler.badRequest(res, "Vui lòng điền đầy đủ thông tin đánh giá");
        }

        const movie = await Movie.findById(movieId);
        if (!movie) return responseHandler.notFound(res, "Không tìm thấy phim");

        const existing = await Review.findOne({ userId, movieId });
        if (existing) return responseHandler.badRequest(res, "Bạn đã đánh giá phim này rồi");

        const review = await Review.create({
            userId,
            movieId,
            rating: Math.min(10, Math.max(1, Number(rating))),
            comment: comment.trim(),
        });
        await review.populate("userId", "userName");

        return responseHandler.created(res, review);
    } catch (err) {
        console.error("addReview error:", err);
        responseHandler.error(res);
    }
};

// Protected: GET /customer/profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-password -verifyKey -resetToken -verifyKeyExpires -resetTokenExpires");
        return responseHandler.ok(res, user);
    } catch (err) {
        responseHandler.error(res);
    }
};

// Protected: PUT /customer/profile
const updateProfile = async (req, res) => {
    try {
        const { userName } = req.body;
        if (!userName?.trim()) return responseHandler.badRequest(res, "Tên không được để trống");

        const user = await User.findById(req.user._id);
        user.userName = userName.trim();
        await user.save();

        return responseHandler.ok(res, { message: "Cập nhật thành công", userName: user.userName });
    } catch (err) {
        responseHandler.error(res);
    }
};

// Protected: PUT /customer/change-password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword)
            return responseHandler.badRequest(res, "Vui lòng nhập đầy đủ thông tin");
        if (newPassword.length < 6)
            return responseHandler.badRequest(res, "Mật khẩu mới phải có ít nhất 6 ký tự");

        const user = await User.findById(req.user._id);
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return responseHandler.badRequest(res, "Mật khẩu hiện tại không đúng");

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return responseHandler.ok(res, { message: "Đổi mật khẩu thành công" });
    } catch (err) {
        responseHandler.error(res);
    }
};

// Protected: POST /customer/support
const createSupport = async (req, res) => {
    try {
        const { subject, message } = req.body;
        if (!subject?.trim() || !message?.trim())
            return responseHandler.badRequest(res, "Vui lòng điền đầy đủ thông tin");

        const ticket = await Support.create({
            userId: req.user._id,
            subject: subject.trim(),
            message: message.trim(),
        });
        return responseHandler.created(res, ticket);
    } catch (err) {
        responseHandler.error(res);
    }
};

// Protected: GET /customer/support
const getMySupport = async (req, res) => {
    try {
        const tickets = await Support.find({ userId: req.user._id }).sort({ createdAt: -1 });
        return responseHandler.ok(res, tickets);
    } catch (err) {
        responseHandler.error(res);
    }
};

// Protected: POST /customer/favorites/:movieId  (toggle)
const toggleFavorite = async (req, res) => {
    try {
        const { movieId } = req.params;
        const user = await User.findById(req.user._id);
        const idx = user.favorites.findIndex((id) => String(id) === movieId);
        if (idx === -1) {
            user.favorites.push(movieId);
        } else {
            user.favorites.splice(idx, 1);
        }
        await user.save();
        return responseHandler.ok(res, { favorites: user.favorites });
    } catch (err) {
        responseHandler.error(res);
    }
};

// Protected: GET /customer/favorites
const getMyFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("favorites");
        return responseHandler.ok(res, user.favorites || []);
    } catch (err) {
        responseHandler.error(res);
    }
};

export default {
    getShows,
    getShowById,
    getShowSeats,
    createBooking,
    getMyBookings,
    cancelBooking,
    getMyTickets,
    addReview,
    getProfile,
    updateProfile,
    changePassword,
    createSupport,
    getMySupport,
    toggleFavorite,
    getMyFavorites,
    validatePromo,
};

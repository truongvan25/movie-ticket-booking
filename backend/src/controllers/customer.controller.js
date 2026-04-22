import Show from "../models/show.model.js";
import Seat from "../models/seat.model.js";
import Booking from "../models/booking.model.js";
import Ticket from "../models/ticket.model.js";
import Review from "../models/review.model.js";
import Movie from "../models/movie.model.js";
import Theater from "../models/theater.model.js";
import Room from "../models/rooms.model.js";
import responseHandler from "../handlers/response.handler.js";

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
            .populate("theaterId", "theaterName address")
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
            .populate("theaterId", "theaterName address")
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

// Protected: POST /customer/bookings
const createBooking = async (req, res) => {
    try {
        const { showId, seatIds } = req.body;
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
        booking.tickets = tickets.map((t) => t._id);
        booking.totalPrice = totalPrice;
        await booking.save();

        return responseHandler.created(res, { booking, tickets });
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
                    { path: "theaterId", select: "theaterName address" },
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

export default {
    getShows,
    getShowById,
    getShowSeats,
    createBooking,
    getMyBookings,
    cancelBooking,
    getMyTickets,
    addReview,
};

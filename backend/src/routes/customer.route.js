import express from "express";
import customerController from "../controllers/customer.controller.js";

const router = express.Router();

router.post("/bookings", customerController.createBooking);
router.get("/bookings", customerController.getMyBookings);
router.put("/bookings/:bookingId/cancel", customerController.cancelBooking);
router.get("/tickets", customerController.getMyTickets);
router.post("/reviews", customerController.addReview);

export default router;

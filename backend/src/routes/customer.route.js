import express from "express";
import customerController from "../controllers/customer.controller.js";

const router = express.Router();

router.get("/profile", customerController.getProfile);
router.put("/profile", customerController.updateProfile);
router.put("/change-password", customerController.changePassword);

router.post("/bookings", customerController.createBooking);
router.get("/bookings", customerController.getMyBookings);
router.put("/bookings/:bookingId/cancel", customerController.cancelBooking);
router.get("/tickets", customerController.getMyTickets);
router.post("/reviews", customerController.addReview);

router.post("/support", customerController.createSupport);
router.get("/support", customerController.getMySupport);

router.post("/validate-promo", customerController.validatePromo);

router.get("/favorites", customerController.getMyFavorites);
router.post("/favorites/:movieId", customerController.toggleFavorite);

export default router;

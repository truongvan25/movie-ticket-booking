import express from "express";
import adminController from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/stats", adminController.getStats);

router.get("/users", adminController.getUsers);
router.put("/users/:userId", adminController.updateUser);
router.delete("/users/:userId", adminController.deleteUser);

router.get("/movies", adminController.getMovies);
router.put("/movies/:movieId", adminController.updateMovie);
router.delete("/movies/:movieId", adminController.deleteMovie);

router.get("/theaters", adminController.getTheaters);

router.get("/bookings", adminController.getBookings);

router.get("/revenue", adminController.getRevenue);

export default router;

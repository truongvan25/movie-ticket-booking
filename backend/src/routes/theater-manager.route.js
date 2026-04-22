import express from "express";
import tm from "../controllers/theater-manager.controller.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();
router.use(tokenMiddleware.auth, authorizeRoles(["theater-manager"]));

router.get("/stats", tm.getStats);
router.get("/theaters", tm.getMyTheaters);

router.get("/movies", tm.getMovies);
router.post("/movies", tm.addMovie);
router.put("/movies/:movieId", tm.updateMovie);
router.delete("/movies/:movieId", tm.deleteMovie);

router.get("/rooms", tm.getRooms);
router.post("/rooms", tm.addRoom);
router.delete("/rooms/:roomId", tm.deleteRoom);

router.get("/shows", tm.getShows);
router.post("/shows", tm.addShow);
router.put("/shows/:showId", tm.updateShow);
router.delete("/shows/:showId", tm.deleteShow);

router.get("/bookings", tm.getBookings);

export default router;

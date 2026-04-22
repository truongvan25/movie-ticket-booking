import express from "express";
import movieController from "../controllers/movie.controller.js";

const router = express.Router();

router.get("/", movieController.getMovies);
router.get("/:movieId", movieController.getMovieById);
router.get("/:movieId/reviews", movieController.getMovieReviews);

export default router;

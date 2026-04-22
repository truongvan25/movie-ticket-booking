import express from "express";
import movieController from "../controllers/movie.controller.js";

const router = express.Router();

router.get("/", movieController.getMovies);
router.get("/:movieId", movieController.getMovieById);

export default router;

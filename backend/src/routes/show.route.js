import express from "express";
import customerController from "../controllers/customer.controller.js";

const router = express.Router();

router.get("/", customerController.getShows);
router.get("/:showId", customerController.getShowById);
router.get("/:showId/seats", customerController.getShowSeats);

export default router;

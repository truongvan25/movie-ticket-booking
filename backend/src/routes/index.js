import express from "express";
import token from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

import userRoute from "./user.route.js";
import movieRoute from "./movie.route.js";
import showRoute from "./show.route.js";
import theaterRoute from "./theater.route.js";
import theaterManagerRoute from "./theater-manager.route.js";
import adminRoute from "./admin.route.js";
import customerRoute from "./customer.route.js";

const router = express.Router();

router.use("/user", userRoute);
router.use("/movies", movieRoute);
router.use("/shows", showRoute);

router.use(token.auth);
router.use("/admin", authorizeRoles(["admin"]), adminRoute);
router.use("/theater-manager", authorizeRoles(["theater-manager"]), theaterManagerRoute);
router.use("/theater", authorizeRoles(["admin"]), theaterRoute);
router.use("/customer", customerRoute);

export default router;

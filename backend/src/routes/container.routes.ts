import { Router } from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { createContainer } from "../controllers/container.controller.js";

const router = Router();
router.use(verifyUser);

router.route("/create").post(createContainer);

export default router;
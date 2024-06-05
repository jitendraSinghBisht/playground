import { Router } from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { signUp, signIn, logOut, authenticate } from "../controllers/user.controller.js";

const router = Router();

router.route("/sign-up").post(signUp);
router.route("/sign-in").post(signIn);
router.route("/log-out").post(verifyUser, logOut);
router.route("/authenticate").get(verifyUser, authenticate);

export default router;
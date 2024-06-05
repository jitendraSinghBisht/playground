import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controller.js";

const router = Router();

router.route("/hello").get(healthCheck);

export default router;
import { Router } from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { createVolume, getOldVolumes } from "../controllers/volume.controller.js";

const router = Router();
router.use(verifyUser);

router.route("/create").post(createVolume);
router.route("/get-old-volumes").get(getOldVolumes);

export default router;
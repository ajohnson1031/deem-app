// src/routes/me.ts
import { Router } from "express";
import { getMeHandler, getMy2faStatusHandler, updateMeHandler } from "../controllers/me.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", getMeHandler);
router.get("/2fa-status", getMy2faStatusHandler);
router.patch("/", updateMeHandler);

export default router;

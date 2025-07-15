// src/routes/me.ts
import { Router } from "express";
import { getMeHandler, updateMeHandler } from "../controllers/me.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", getMeHandler);
router.patch("/", updateMeHandler);

export default router;

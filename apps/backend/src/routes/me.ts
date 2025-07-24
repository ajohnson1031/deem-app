// src/routes/me.ts
import { Router } from "express";
import { getMe, updateMe } from "../controllers/me.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", getMe);
router.patch("/", updateMe);

export default router;

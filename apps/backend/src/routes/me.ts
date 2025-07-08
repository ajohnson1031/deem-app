// src/routes/me.ts
import { Router } from "express";
import { getMeHandler } from "../controllers/me.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, getMeHandler);

export default router;

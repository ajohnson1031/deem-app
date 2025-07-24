// src/routes/wallet.ts

import { Router } from "express";
import { createWallet, getWallet, updateSeed } from "../controllers/wallet.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", getWallet);
router.post("/", createWallet);
router.patch("/", updateSeed);

export default router;

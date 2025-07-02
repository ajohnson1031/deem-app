// src/routes/wallet.ts

import { Router } from "express";
import { createWalletHandler, getWalletHandler, updateWalletSeedHandler } from "../controllers/wallet.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", getWalletHandler);
router.post("/", createWalletHandler);
router.patch("/", updateWalletSeedHandler);

export default router;

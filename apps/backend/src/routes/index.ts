import { Router } from "express";
import authRoutes from "./auth";
import contactsRoutes from "./contacts";
import meRoutes from "./me";
import walletRoutes from "./wallet";

const router = Router();

router.use("/contacts", contactsRoutes);
router.use("/auth", authRoutes);
router.use("/wallet", walletRoutes);
router.use("/me", meRoutes);

export default router;

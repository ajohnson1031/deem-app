import { Router } from "express";
import authRoutes from "./auth";
import contactsRoutes from "./contacts";
import walletRoutes from "./wallet";

const router = Router();

router.use("/contacts", contactsRoutes);
router.use("/auth", authRoutes);
router.use("/wallet", walletRoutes);

export default router;

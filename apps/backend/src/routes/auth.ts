import { Router } from "express";
import {
  changePassword,
  checkUsernameAvailable,
  getMy2FAStatus,
  login,
  logout,
  refreshToken,
  register,
  requestPasswordReset,
  verify2FA,
  verifyPassword,
  verifyPasswordResetCode,
} from "../controllers/auth.controller";

import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/verify-password", requireAuth, verifyPassword);
router.get("/2fa-status", requireAuth, getMy2FAStatus);
router.post("/refresh", requireAuth, refreshToken);
router.post("/verify-2fa", requireAuth, verify2FA);
router.get("/check-username", checkUsernameAvailable);
router.post("/logout", requireAuth, logout);

router.post("/login", login);
router.post("/register", register);
router.post("/request-password-reset", requestPasswordReset);
router.post("/verify-reset-code", verifyPasswordResetCode);
router.patch("/password", changePassword);

export default router;

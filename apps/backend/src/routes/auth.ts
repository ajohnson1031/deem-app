import { Router } from "express";
import {
  changePasswordHandler,
  checkUsernameAvailability,
  getMy2faStatusHandler,
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
  registerHandler,
  requestPasswordReset,
  verify2FAHandler,
  verifyPasswordResetCode,
} from "../controllers/auth.controller";

const router = Router();

router.get("/check-username", checkUsernameAvailability);
router.get("/2fa-status", getMy2faStatusHandler);
router.post("/login", loginHandler);
router.post("/refresh", refreshTokenHandler);
router.post("/logout", logoutHandler);
router.post("/register", registerHandler);
router.post("/request-password-reset", requestPasswordReset);
router.post("/verify-reset-code", verifyPasswordResetCode);
router.post("/verify-2fa", verify2FAHandler)
router.patch("/password", changePasswordHandler);

export default router;

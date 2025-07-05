import { Router } from "express";
import {
  changePasswordHandler,
  checkUsernameAvailability,
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
  registerHandler,
  requestPasswordReset,
  verifyPasswordResetCode,
} from "../controllers/auth.controller";

const router = Router();

router.get("/check-username", checkUsernameAvailability);
router.post("/login", loginHandler);
router.post("/refresh", refreshTokenHandler);
router.post("/logout", logoutHandler);
router.post("/register", registerHandler);
router.post("/request-password-reset", requestPasswordReset);
router.post("/verify-reset-code", verifyPasswordResetCode);
router.patch("/password", changePasswordHandler);

export default router;

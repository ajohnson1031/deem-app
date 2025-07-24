import { generate2FASecret, getMy2FAStatus, verify2FA } from "../handlers/auth/2FA";
import { login } from "../handlers/auth/login";
import { logout } from "../handlers/auth/logout";
import { changePassword, requestPasswordReset, resetPassword, verifyPassword, verifyPasswordResetCode } from "../handlers/auth/password";
import { checkUsernameAvailable, register } from "../handlers/auth/registration";
import { refreshToken } from "../handlers/auth/token";

export {
  changePassword,
  checkUsernameAvailable,
  generate2FASecret,
  getMy2FAStatus,
  login,
  logout,
  refreshToken,
  register,
  requestPasswordReset,
  resetPassword,
  verify2FA,
  verifyPassword,
  verifyPasswordResetCode,
};

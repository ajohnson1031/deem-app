import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import qrcode from "qrcode";
import speakeasy from "speakeasy";
import prisma from "../prisma/client";
import { decryptSeed, deriveKey, encryptSeed } from "../utils/crypto";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "15m";
const REFRESH_SECRET = process.env.REFRESH_SECRET || JWT_SECRET;
const REFRESH_EXPIRES_IN = "7d";

const registerHandler = async (req: Request, res: Response) => {
  const { username, password, email, name, phoneNumber, avatarUri, walletAddress, encryptedSeed, countryCode = "US", callingCode = "1", twoFactorEnabled = false } = req.body;

  if (!username || !password || !walletAddress || !encryptedSeed || !name) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existing) {
      return res.status(409).json({ error: "User already exists." });
    }

    const existingWallet = await prisma.user.findFirst({
      where: { walletAddress },
    });

    if (existingWallet) {
      return res.status(409).json({ error: "Wallet address already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let twoFactorSecret: string | undefined;

    if (twoFactorEnabled) {
      const secret = speakeasy.generateSecret({
        name: `Deem (${username})`,
      });
      twoFactorSecret = secret.base32;
    }

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        name,
        phoneNumber,
        avatarUri,
        walletAddress,
        countryCode,
        callingCode,
        twoFactorEnabled,
        twoFactorSecret,
        wallet: {
          create: {
            encryptedSeed,
          },
        },
      },
      include: {
        wallet: true,
      },
    });

    const { password: _pw, wallet: _wallet, twoFactorSecret: _2faSecret, ...userData } = user;

    return res.status(201).json({ user: userData });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const loginHandler = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: "Missing identifier or password." });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // If 2FA is enabled, return a partial response
    if (user.twoFactorEnabled) {
      return res.status(200).json({
        requires2FA: true,
        tempUserId: user.id,
      });
    }

    // Normal login flow
    const payload = { userId: user.id };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: dayjs().add(7, "day").toDate(),
      },
    });

    const { password: _pw, ...userData } = user;

    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
      .json({ user: userData, token: accessToken });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const logoutHandler = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token required." });
  }

  try {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ error: "Failed to logout." });
  }
};

const refreshTokenHandler = async (req: Request, res: Response) => {
  console.log("🔥 /auth/refresh called");
  const token = req.cookies.refreshToken;
  console.log("Token in cookie:", token);

  if (!token) {
    return res.status(401).json({ error: "Refresh token missing." });
  }

  try {
    // Check if token exists in DB
    const stored = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!stored) {
      return res.status(403).json({ error: "Invalid refresh token." });
    }

    const payload = jwt.verify(token, REFRESH_SECRET) as { userId: string };

    const newAccessToken = jwt.sign({ userId: payload.userId }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.json({ token: newAccessToken });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(403).json({ error: "Invalid or expired refresh token." });
  }
};

const changePasswordHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { oldPassword, newPassword } = req.body;

  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  });

  if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
    return res.status(401).json({ error: "Invalid current password." });
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  // 1. Update user password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  // 2. Re-encrypt wallet seed if wallet exists
  if (user.wallet?.encryptedSeed) {
    try {
      const oldKey = await deriveKey(oldPassword);
      const newKey = await deriveKey(newPassword);

      const decryptedSeed = decryptSeed(user.wallet.encryptedSeed, oldKey);
      if (!decryptedSeed) {
        console.warn("⚠️ Failed to decrypt wallet seed during password change.");
        return res.status(500).json({ error: "Wallet seed decryption failed." });
      }

      const newEncryptedSeed = encryptSeed(decryptedSeed, newKey);

      await prisma.wallet.update({
        where: { userId },
        data: { encryptedSeed: newEncryptedSeed },
      });
    } catch (err) {
      console.error("⚠️ Wallet re-encryption error:", err);
      return res.status(500).json({ error: "Wallet re-encryption failed." });
    }
  }

  return res.status(200).json({ message: "Password updated." });
};

const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Return 200 regardless to prevent user enumeration
    return res.status(200).json({ message: "If the email is valid, a code was sent." });
  }

  const cooldownWindow = dayjs().subtract(3, "minutes").toDate();

  const recentCode = await prisma.passwordResetCode.findFirst({
    where: {
      userId: user.id,
      createdAt: {
        gte: cooldownWindow,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recentCode) {
    return res.status(429).json({ error: "Please wait before requesting a new code." });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

  await prisma.passwordResetCode.create({
    data: {
      userId: user.id,
      code,
      expiresAt: dayjs().add(10, "minutes").toDate(),
    },
  });

  // Placeholder: send email
  console.log(`🔐 Sending reset code ${code} to email ${email}`);

  return res.status(200).json({ message: "Reset code sent to email." });
};

const verifyPasswordResetCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: "Missing data" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "Invalid code or email" });

  const record = await prisma.passwordResetCode.findFirst({
    where: {
      userId: user.id,
      code,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  return res.status(200).json({ message: "Code verified", userId: user.id });
};

const resetPassword = async (req: Request, res: Response) => {
  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res.status(400).json({ error: "Missing data" });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  await prisma.passwordResetCode.deleteMany({ where: { userId } }); // cleanup
  await prisma.refreshToken.deleteMany({ where: { userId } });

  return res.status(200).json({ message: "Password updated." });
};

const checkUsernameAvailability = async (req: Request, res: Response) => {
  const { username } = req.query;
  if (typeof username !== "string" || username.trim() === "") {
    return res.status(400).json({ available: false, error: "Invalid username" });
  }

  const existing = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
  });

  return res.status(200).json({ available: !existing });
};

const generate2FASecret = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized Request" });
  }

  const secret = speakeasy.generateSecret({
    name: `Deem (${user.id})`,
  });

  if (!secret.otpauth_url) {
    throw new Error("OTP Auth URL is missing from secret.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorSecret: secret.base32,
    },
  });

  const qrCode = await qrcode.toDataURL(secret.otpauth_url);

  res.json({
    qrCode, // Data URI
    secret: secret.base32, // Optional, for debug only
  });
};

const getMy2faStatusHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ error: "Unauthorized Request." });
    return res.json({ twoFactorEnabled: user.twoFactorEnabled });
  } catch (err) {
    console.error("Could not get 2FA status:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const verify2FAHandler = async (req: Request, res: Response) => {
  const { tempUserId, token: otpToken } = req.body;

  if (!tempUserId || !otpToken) {
    return res.status(400).json({ error: "Missing 2FA verification input." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: tempUserId } });

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ error: "Invalid user or 2FA not setup." });
    }

    const valid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: otpToken,
      window: 1,
    });

    if (!valid) {
      return res.status(401).json({ error: "Invalid 2FA token." });
    }

    const JWT_SECRET = process.env.JWT_SECRET!;
    const JWT_EXPIRES_IN = "15m";
    const REFRESH_SECRET = process.env.REFRESH_SECRET || JWT_SECRET;
    const REFRESH_EXPIRES_IN = "7d";

    const payload = { userId: user.id };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: dayjs().add(7, "day").toDate(),
      },
    });

    const { password: _pw, ...userData } = user;

    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
      .json({ user: userData, token: accessToken });
  } catch (err) {
    console.error("2FA verification error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export {
  changePasswordHandler,
  checkUsernameAvailability,
  generate2FASecret,
  getMy2faStatusHandler,
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
  registerHandler,
  requestPasswordReset,
  resetPassword,
  verify2FAHandler,
  verifyPasswordResetCode,
};

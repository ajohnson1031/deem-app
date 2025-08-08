import { Request, Response } from "express";
import qrcode from "qrcode";
import speakeasy from "speakeasy";
import prisma from "../../prisma/client";
import { RedisFuncType, safeRedis } from "../redis";

const generate2FASecret = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized Request" });
  }

  const id = req.user.id;
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) return res.status(400).json({ error: "User not found." });

  const secret = speakeasy.generateSecret({
    name: `Deem (${user.email})`,
  });

  if (!secret.otpauth_url) {
    return res.status(500).json({ error: "Failed to generate OTP URL." });
  }

  await prisma.user.update({
    where: { id },
    data: {
      tempTwoFactorSecret: secret.base32,
    },
  });

  const qrCode = await qrcode.toDataURL(secret.otpauth_url);

  res.json({
    qrCode, // Data URI
    secret: process.env.NODE_ENV === "production" ? undefined : secret.base32,
  });
};

const verifyAndEnable2FA = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { token } = req.body;

  if (!userId || !token) {
    return res.status(400).json({ error: "Missing data." });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.tempTwoFactorSecret) {
    return res.status(400).json({ error: "2FA setup not initiated." });
  }

  const isValid = speakeasy.totp.verify({
    secret: user.tempTwoFactorSecret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!isValid) {
    return res.status(401).json({ error: "Invalid 2FA token." });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: user.tempTwoFactorSecret,
      tempTwoFactorSecret: null,
      twoFactorEnabled: true,
    },
  });

  res.json({ message: "2FA enabled successfully.", twoFactorEnabled: true });
};

// Check Current 2FA Status (no changes needed)
const getMy2FAStatus = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: "Unauthorized Request." });
  return res.json({ twoFactorEnabled: user.twoFactorEnabled });
};

// Verify Existing 2FA token (for login/security checks)
const verify2FA = async (req: Request, res: Response) => {
  const { userId, token: otpToken } = req.body;

  if (!userId || !otpToken) {
    return res.status(400).json({ error: "Missing 2FA verification input." });
  }

  const key = `2fa_attempts:${userId}`;

  try {
    const attempts = (await safeRedis(key, RedisFuncType.INCR)) as number;

    if (attempts === 1) {
      await safeRedis(key, RedisFuncType.EXPIRE, { value: userId, ttl: 300 }); // 5 min
    }

    if (attempts > 5) {
      return res.status(429).json({ error: "Too many invalid 2FA attempts. Try again in 5 minutes." });
    }
  } catch (err) {
    console.error("Redis rate limiting failed:", err);
    return res.status(503).json({ error: "Verification temporarily unavailable." });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

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

  await safeRedis(key, RedisFuncType.DEL);

  return res.json({ message: "2FA token verified successfully." });
};

// Disable 2FA
const disable2FA = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { token } = req.body;

  if (!userId || !token) {
    return res.status(400).json({ error: "Missing data." });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.twoFactorSecret || !user.twoFactorEnabled) {
    return res.status(400).json({ error: "2FA not currently enabled." });
  }

  const isValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!isValid) {
    return res.status(401).json({ error: "Invalid 2FA token." });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });

  res.json({ message: "2FA disabled successfully.", twoFactorEnabled: false });
};

export { disable2FA, generate2FASecret, getMy2FAStatus, verify2FA, verifyAndEnable2FA };

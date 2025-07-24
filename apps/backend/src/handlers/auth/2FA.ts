import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import qrcode from "qrcode";
import speakeasy from "speakeasy";
import { JWT_EXPIRES_IN, JWT_SECRET, REFRESH_EXPIRES_IN, REFRESH_SECRET } from "../../config/env";
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
    throw new Error("OTP Auth URL is missing from secret.");
  }

  await prisma.user.update({
    where: { id },
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

const getMy2FAStatus = async (req: Request, res: Response) => {
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

const verify2FA = async (req: Request, res: Response) => {
  const { tempUserId, token: otpToken } = req.body;

  if (!tempUserId || !otpToken) {
    return res.status(400).json({ error: "Missing 2FA verification input." });
  }

  const key = `2fa_attempts:${tempUserId}`;

  try {
    const attempts = (await safeRedis(key, RedisFuncType.INCR)) as number;

    if (attempts === 1) {
      await safeRedis(key, RedisFuncType.EXPIRE, { value: tempUserId, ttl: 300 }); // 5 min
    }

    if (attempts > 5) {
      return res.status(429).json({ error: "Too many 2FA attempts. Try again in 5 minutes." });
    }
  } catch (err) {
    console.error("Redis rate limiting failed:", err);
    return res.status(503).json({ error: "Verification temporarily unavailable." });
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

    // Clear rate limit after successful verification
    await safeRedis(key, RedisFuncType.DEL);

    const payload = { userId: user.id };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

    await safeRedis(
      `refresh:${refreshToken}`,
      RedisFuncType.SETEX,
      { value: user.id, ttl: 60 * 60 * 24 * 7 } // 7 days in seconds
    );

    const { password: _pw, twoFactorSecret: _2faSecret, ...userData } = user;

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

const toggle2FA = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { token } = req.body;

  if (!userId || !token) {
    return res.status(400).json({ error: "Missing data." });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const currentlyEnabled = user.twoFactorEnabled;

  // ⛔ Attempting to enable 2FA, but no secret has been configured yet
  if (!currentlyEnabled && !user.twoFactorSecret) {
    return res.status(400).json({
      error: "2FA setup required before enabling.",
      setupRequired: true,
    });
  }

  const isValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret!,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!isValid) {
    return res.status(401).json({ error: "Invalid 2FA token." });
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: !currentlyEnabled,
      twoFactorSecret: currentlyEnabled ? null : user.twoFactorSecret, // nullify if disabling
    },
  });

  return res.json({
    message: `2FA ${updatedUser.twoFactorEnabled ? "enabled" : "disabled"} successfully.`,
    twoFactorEnabled: updatedUser.twoFactorEnabled,
  });
};

export { generate2FASecret, getMy2FAStatus, toggle2FA, verify2FA };

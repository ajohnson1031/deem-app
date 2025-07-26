import bcrypt from "bcrypt";
import { Request, Response } from "express";
import prisma from "../../prisma/client";
import { decryptSeed, deriveKey, encryptSeed } from "../../utils/crypto";
import { RedisFuncType, safeRedis, safeSetEx } from "../redis";

const changePassword = async (req: Request, res: Response) => {
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
  if (!email) return res.status(400).json({ error: "Email is required." });

  const user = await prisma.user.findUnique({ where: { email } });

  // Don't reveal if user doesn't exist
  if (!user) return res.status(200).json({ message: "If the email is valid, a code was sent." });

  const cooldownKey = `reset:cooldown:${user.id}`;
  const onCooldown = await safeRedis(cooldownKey, RedisFuncType.EXISTS);
  if (onCooldown) {
    return res.status(429).json({ error: "Please wait before requesting a new code." });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await safeSetEx(`reset:code:${user.id}`, 600, code); // expires in 10 min
  await safeSetEx(cooldownKey, 180, "1"); // 3 min cooldown

  // TODO: send email here
  console.log(`📨 Sending code ${code} to ${email}`);

  return res.status(200).json({ message: "Reset code sent to email." });
};

const verifyPassword = async (req: Request, res: Response) => {
  const { id, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    const { password: _pw } = user;

    const passwordVerified = await bcrypt.compare(password, _pw);

    if (!passwordVerified) {
      return res.status(400).json({ message: "Password not verified." });
    }

    return res.status(200).json({ message: "Password is verified." });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

const verifyPasswordResetCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: "Missing data" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "Invalid code or email" });

  const storedCode = await safeRedis(`reset:code:${user.id}`, RedisFuncType.GET);

  if (!storedCode || storedCode !== code) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  await safeRedis(`reset:code:${user.id}`, RedisFuncType.DEL); // One-time use

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

  // Optional: If you want to delete *all* of a user's refresh tokens, you'll need to track them
  // individually or use a pattern with Redis SCAN (not ideal in production for mass deletion)
  // Here's a simple placeholder to indicate we're skipping deletion here for now

  console.warn("⚠️ Skipping refresh token deletion by userId in Redis.");

  return res.status(200).json({ message: "Password updated." });
};

export { changePassword, requestPasswordReset, resetPassword, verifyPassword, verifyPasswordResetCode };

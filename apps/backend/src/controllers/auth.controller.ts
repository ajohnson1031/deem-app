import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client";
import { decryptSeed, deriveKey, encryptSeed } from "../utils/crypto";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "15m";
const REFRESH_SECRET = process.env.REFRESH_SECRET || JWT_SECRET;
const REFRESH_EXPIRES_IN = "7d";

const registerHandler = async (req: Request, res: Response) => {
  const { username, password, email, name, phoneNumber, avatarUrl, walletAddress, encryptedSeed } = req.body;

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

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        name,
        phoneNumber,
        avatarUrl,
        walletAddress,
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

    const { password: _pw, wallet: _wallet, ...userData } = user;

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

    const payload = { userId: user.id };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

    // Store refresh token in DB
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
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
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
  const token = req.cookies?.refreshToken;

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

// auth.controller.ts
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

export { changePasswordHandler, loginHandler, logoutHandler, refreshTokenHandler, registerHandler, requestPasswordReset, resetPassword, verifyPasswordResetCode };

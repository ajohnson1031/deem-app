import bcrypt from "bcrypt";
import { Request, Response } from "express";
import prisma from "../../prisma/client";

const register = async (req: Request, res: Response) => {
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
        twoFactorEnabled: false,
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

const checkUsernameAvailable = async (req: Request, res: Response) => {
  const { username } = req.query;
  if (typeof username !== "string" || username.trim() === "") {
    return res.status(400).json({ available: false, error: "Invalid username" });
  }

  const existing = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
  });

  return res.status(200).json({ available: !existing });
};

export { checkUsernameAvailable, register };

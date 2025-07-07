// src/controllers/wallet.controller.ts
import { Request, Response } from "express";
import prisma from "../prisma/client";

const createWalletHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { encryptedSeed, walletAddress } = req.body;

  if (!userId || !encryptedSeed || !walletAddress) {
    return res.status(400).json({ error: "Missing required data." });
  }

  try {
    // Upsert wallet (replace if exists)
    await prisma.wallet.upsert({
      where: { userId },
      update: { encryptedSeed },
      create: {
        encryptedSeed,
        user: { connect: { id: userId } },
      },
    });

    // Update user's walletAddress (optional)
    await prisma.user.update({
      where: { id: userId },
      data: { walletAddress },
    });

    return res.status(200).json({ message: "Wallet updated." });
  } catch (err) {
    console.error("Wallet upsert error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const getWalletHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found." });
    }

    return res.json({ encryptedSeed: wallet.encryptedSeed });
  } catch (err) {
    console.error("Get wallet error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const updateWalletSeedHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { encryptedSeed } = req.body;

  if (!userId || !encryptedSeed) {
    return res.status(400).json({ error: "Missing required data." });
  }

  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found." });
    }

    await prisma.wallet.update({
      where: { userId },
      data: { encryptedSeed },
    });

    return res.status(200).json({ message: "Wallet seed updated." });
  } catch (err) {
    console.error("Update wallet seed error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export { createWalletHandler, getWalletHandler, updateWalletSeedHandler };

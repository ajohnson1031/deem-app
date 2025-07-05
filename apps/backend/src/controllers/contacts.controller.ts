import { Request, Response } from "express";
import prisma from "../prisma/client";

export const getContactsHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const contacts = await prisma.contact.findMany({
      where: { userId },
    });

    return res.json(contacts);
  } catch (err) {
    console.error("getContactsHandler error:", err);
    return res.status(500).json({ error: "Failed to fetch contacts." });
  }
};

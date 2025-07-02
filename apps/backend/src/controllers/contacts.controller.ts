import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../prisma/client";

export const getContactsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const contacts = await prisma.contact.findMany({
      where: { userId },
    });

    return res.json(contacts);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch contacts." });
  }
};

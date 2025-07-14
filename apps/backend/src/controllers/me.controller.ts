// src/controllers/me.controller.ts
import { Request, Response } from "express";
import { z, ZodError } from "zod";
import prisma from "../prisma/client";

const getMeHandler = async (req: Request, res: Response) => {
  const user = req.user;
  console.log("me is being called with", user);
  if (!user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Optionally fetch user details from DB if needed
  return res.json({ user });
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

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  username: z.string().min(6).max(30).optional(),
  email: z.email().max(100).optional(),
  phoneNumber: z.string().max(50).optional(),
  countryCode: z.string().length(2).optional(),
  callingCode: z.string().min(1).max(5).optional(),
  avatarUri: z.url().nullable().optional(),
});

const updateMeHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized request." });
  }

  try {
    // 1. Validate only allowed fields
    const validatedData = updateUserSchema.parse(req.body);

    // 2. Fetch existing user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // 3. Perform the update
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
    });

    // 4. Build object of only changed fields
    const changedFields: Partial<Record<keyof typeof validatedData, any>> = {};

    for (const key in validatedData) {
      const typedKey = key as keyof typeof validatedData;

      if (validatedData[typedKey] !== user[typedKey]) {
        changedFields[typedKey] = updatedUser[typedKey];
      }
    }

    return res.status(200).json({
      message: "Your profile has been updated.",
      updatedUser: changedFields,
    });
  } catch (err: any) {
    console.error("User update error:", err);

    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "Invalid input.",
        details: z.treeifyError(err).errors, // If you're using zod-tree
      });
    }

    return res.status(500).json({ error: "Internal server error." });
  }
};

export { getMeHandler, getMy2faStatusHandler, updateMeHandler };

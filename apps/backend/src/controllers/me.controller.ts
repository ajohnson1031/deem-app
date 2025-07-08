// src/controllers/me.controller.ts
import { Request, Response } from "express";

export const getMeHandler = async (req: Request, res: Response) => {
  const user = req.user;
  console.log("me is being called with", user);
  if (!user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Optionally fetch user details from DB if needed
  return res.json({ user });
};

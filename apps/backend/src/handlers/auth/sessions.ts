import { Request, Response } from "express";
import { getUserSessions } from "../redis";

export const getSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || null;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const sessions = await getUserSessions(userId);
    return res.json({ sessions, count: sessions.length });
  } catch (err) {
    console.error("Get sessions error:", err);
    return res.status(500).json({ error: "Failed to fetch sessions." });
  }
};

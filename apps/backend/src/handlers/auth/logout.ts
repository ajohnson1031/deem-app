import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { REFRESH_SECRET } from "../../config/env";
import { deleteSession, RedisFuncType, safeRedis } from "../redis";

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token required." });
  }

  try {
    await safeRedis(`refresh:${refreshToken}`, RedisFuncType.DEL);

    // --- Session deletion ---
    let userId = null;
    let sessionId = req.body?.sessionId || req.query?.sessionId;
    try {
      const payload = jwt.verify(refreshToken, REFRESH_SECRET) as any;
      userId = payload.userId;
    } catch {}
    if (userId && sessionId) {
      await deleteSession(userId, sessionId);
    }

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

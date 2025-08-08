import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET, REFRESH_SECRET } from "../../config/env";
import { RedisFuncType, safeRedis } from "../redis";

export const refreshToken = async (req: Request, res: Response) => {
  console.log("🔥 /auth/refresh called");
  const token = req.cookies.refreshToken || req.body.refreshToken;
  console.log("Token in cookie:", token);

  if (!token) {
    return res.status(401).json({ error: "Refresh token missing." });
  }

  try {
    // Check if token exists in DB
    const userId = await safeRedis(`refresh:${token}`, RedisFuncType.GET);

    if (!userId) {
      return res.status(403).json({ error: "Invalid or expired refresh token." });
    }

    const payload = jwt.verify(token, REFRESH_SECRET) as { userId: string };

    if (payload.userId !== userId) {
      return res.status(403).json({ error: "Token mismatch." });
    }

    const newAccessToken = jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.json({ token: newAccessToken, refreshToken: token });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(403).json({ error: "Invalid or expired refresh token." });
  }
};

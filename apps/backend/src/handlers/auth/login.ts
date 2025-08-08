import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import z from "zod";
import { JWT_EXPIRES_IN, JWT_SECRET, REFRESH_EXPIRES_IN, REFRESH_SECRET } from "../../config/env";
import { RedisFuncType, safeRedis } from "../../handlers/redis";
import prisma from "../../prisma/client";

const loginSchema = z.object({
  identifier: z.string().nonempty(),
  password: z.string().min(8),
});

export const login = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: "Invalid input" });

  const { identifier, password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // If 2FA is enabled, return a partial response
    if (user.twoFactorEnabled) {
      return res.status(200).json({
        requires2FA: true,
        tempUserId: user.id,
      });
    }

    // Normal login flow
    const payload = { userId: user.id };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

    await safeRedis(`refresh:${refreshToken}`, RedisFuncType.SETEX, { value: user.id, ttl: 60 * 60 * 24 * 7 }); // 7 days

    const { password: _pw, twoFactorSecret: _2faSecret, ...userData } = user;

    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
      .json({ user: userData, token: accessToken, refreshToken });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

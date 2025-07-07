import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// Extend Express.Request globally
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

// middleware/auth.ts
interface RequestWithUser extends Request {
  user?: { id: string };
}

export const requireAuth = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // ✅ Attach user to request so controllers can access it
    (req as any).user = { id: decoded.userId };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

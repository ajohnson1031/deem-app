import { PrismaClient } from "@prisma/client";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import routes from "./routes";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "exp://192.168.1.97:8081", // or your Expo DevTools URL
    credentials: true,
  })
);

app.use("/", routes);

app.get("/health", async (req, res) => {
  try {
    // Simple query to check DB connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

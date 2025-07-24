import { Router } from "express";
import { getRedisHealth } from "../handlers/health";

const router = Router();

router.get("/redis", getRedisHealth);

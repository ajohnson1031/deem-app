import { Request, Response } from "express";
import redis from "../../utils/redis";

enum RedisFuncType {
  GET = "GET",
  INCR = "INCR",
  DEL = "DEL",
  EXISTS = "EXISTS",
  SETEX = "SETEX",
  EXPIRE = "EXPIRE",
}

let redisDown = false;

async function safeRedis(key: string, type: RedisFuncType, options?: { ttl?: number; value?: string }): Promise<any> {
  try {
    redisDown = false;

    switch (type) {
      case RedisFuncType.GET:
        return await redis.get(key);

      case RedisFuncType.SETEX:
        if (!options?.ttl || typeof options.value !== "string") {
          throw new Error("SETEX requires both ttl and value.");
        }
        return await redis.setex(key, options.ttl, options.value);

      case RedisFuncType.INCR:
        return await redis.incr(key);

      case RedisFuncType.DEL:
        return await redis.del(key);

      case RedisFuncType.EXISTS:
        return await redis.exists(key);

      case RedisFuncType.EXPIRE:
        if (!options?.ttl) throw new Error("EXPIRE requires a TTL.");
        return await redis.expire(key, options.ttl);

      default:
        throw new Error("Invalid Redis function type");
    }
  } catch (err) {
    if (!redisDown) {
      console.error("❌ Redis error:", err);
      redisDown = true;
    }
    throw new Error("Redis unavailable");
  }
}

async function safeSetEx(key: string, ttlSeconds: number, value: string): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, value);
    redisDown = false;
  } catch (err) {
    if (!redisDown) {
      console.error("❌ Redis connection error (setex):", err);
      redisDown = true;
    }
    throw new Error("Redis unavailable");
  }
}

async function safeSetRefreshToken(token: string, userId: string, ttlSeconds: number) {
  try {
    await redis.set(`refresh:${token}`, userId, "EX", ttlSeconds);
    redisDown = false;
  } catch (err) {
    if (!redisDown) {
      console.error("❌ Redis error (set refresh token):", err);
      redisDown = true;
    }
    throw new Error("Redis unavailable");
  }
}

async function safeGetRefreshToken(token: string): Promise<string | null> {
  try {
    const userId = await redis.get(`refresh:${token}`);
    redisDown = false;
    return userId;
  } catch (err) {
    if (!redisDown) {
      console.error("❌ Redis error (get refresh token):", err);
      redisDown = true;
    }
    throw new Error("Redis unavailable");
  }
}

async function safeDeleteRefreshToken(token: string) {
  try {
    await redis.del(`refresh:${token}`);
    redisDown = false;
  } catch (err) {
    if (!redisDown) {
      console.error("❌ Redis error (del refresh token):", err);
      redisDown = true;
    }
    throw new Error("Redis unavailable");
  }
}

const getRedisHealth = async (req: Request, res: Response) => {
  try {
    const redisPing = await redis.ping();
    if (redisPing !== "PONG") {
      throw new Error("Redis did not respond to PING");
    }

    return res.status(200).json({
      status: "ok",
      redis: "connected",
    });
  } catch (err) {
    console.error("❌ Redis health check failed:", err);
    return res.status(500).json({
      status: "error",
      redis: "unreachable",
    });
  }
};

export { getRedisHealth, RedisFuncType, safeDeleteRefreshToken, safeGetRefreshToken, safeRedis, safeSetEx, safeSetRefreshToken };

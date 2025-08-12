import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
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

// --- Session Handling ---
// Create a session
async function createSession(userId: string, deviceInfo: Record<string, any>, ttlSeconds: number = 60 * 60 * 24 * 7) {
  const sessionId = uuidv4();
  const sessionKey = `session:${sessionId}`;
  const userSessionsKey = `user_sessions:${userId}`;
  const now = Date.now();

  await redis.hmset(sessionKey, {
    userId,
    ...deviceInfo, // e.g., userAgent, platform, ip, etc.
    createdAt: now,
    lastActive: now,
  });
  await redis.expire(sessionKey, ttlSeconds);
  await redis.sadd(userSessionsKey, sessionId);
  return sessionId;
}

// Delete a session
async function deleteSession(userId: string, sessionId: string) {
  const sessionKey = `session:${sessionId}`;
  const userSessionsKey = `user_sessions:${userId}`;
  await redis.del(sessionKey);
  await redis.srem(userSessionsKey, sessionId);
}

// Get all sessions for a user
async function getUserSessions(userId: string) {
  const userSessionsKey = `user_sessions:${userId}`;
  const sessionIds = await redis.smembers(userSessionsKey);
  const sessions = await Promise.all(
    sessionIds.map(async (id) => {
      const data = await redis.hgetall(`session:${id}`);
      return { sessionId: id, ...data };
    })
  );
  return sessions;
}

export { createSession, deleteSession, getRedisHealth, getUserSessions, RedisFuncType, safeDeleteRefreshToken, safeGetRefreshToken, safeRedis, safeSetEx, safeSetRefreshToken };

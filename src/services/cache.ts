import Redis from "ioredis";
import { createStaleWhileRevalidateCache } from "stale-while-revalidate-cache";
import dotenv from "dotenv";

dotenv.config();

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : new Redis();

const storage = {
  getItem(cacheKey: string) {
    return redis.get(cacheKey);
  },
  async setItem(cacheKey: string, cacheValue: any) {
    await redis.set(cacheKey, cacheValue);
  },
};

export const swr = createStaleWhileRevalidateCache({
  storage,
  // 5 minutes
  minTimeToStale: 300000,
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

import { registerAs } from "@nestjs/config";

export default registerAs("cache", () => ({
  host: process.env.REDIS_HOST || "localhost",
  port: Number.parseInt(process.env.REDIS_PORT, 10) || 6379,
  ttl: Number.parseInt(process.env.CACHE_TTL, 10) || 5 * 60, // 5 minutes
}));

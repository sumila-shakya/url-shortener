import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

export const RedisClient = new Redis(redisUrl)

RedisClient.on("error", () => {
    console.log("failed to connect to redis")
})
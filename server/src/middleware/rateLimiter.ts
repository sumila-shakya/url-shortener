import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { RedisClient } from "../config/redis.config";
import { MAX_LIMIT, WINDOWN_SIZE } from "../utils/constants";

export const rateLimiter = 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const ip = req.ip || "unknown"
            const key = `ip:${ip}`

            const result = await RedisClient.incr(key)

            if(result == 1) {
                // first request
                await RedisClient.expire(key, WINDOWN_SIZE)
            }
            if(result > MAX_LIMIT) {
                throw new ApiError(429, "Too many requests")
            }

            next()
        } catch(error) {
            next(error)
        }
    }

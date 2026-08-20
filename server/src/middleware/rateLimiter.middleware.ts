import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { RedisClient } from "../config/redis.config";
import { MAX_LIMIT, WINDOWN_SIZE, lua } from "../utils/constants";

export const rateLimiter = 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const ip = req.ip || "unknown"
            const key = `ip:${ip}`

            const result = await RedisClient.eval(
                lua,
                1,
                key,
                WINDOWN_SIZE
            ) as number

            if(result > MAX_LIMIT) {
                throw new ApiError(429, "Too many requests. Please try again later!!")
            }

            next()
        } catch(error) {
            next(error)
        }
    }

import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { RedisClient } from "../config/redis.config";
import { rateLimitDataSchema, rateLimitDataType } from "../utils/validator";

export const rateLimiter = {
    async limitCreation(req: Request, res: Response, next: NextFunction) {
        try {
            const ip = req.ip || "unknown"
            const key = `ip:${ip}`
            const currentTime = Date.now()

            const result = await RedisClient.hgetall(key)

            if(!result || Object.keys(result).length == 0) {
                await RedisClient.hset(key, {
                    firstAt: currentTime,
                    count: 1
                })

                next()
            }
            
            const data: rateLimitDataType = rateLimitDataSchema.parse(result)

            if( currentTime-data.firstAt > 15*60*1000 ) {
                await RedisClient.hset(key, {
                    firstAt: currentTime,
                    count: 1
                })

                next()
            }
            
            if(data.count >= 10) {
                throw new ApiError(429, "Too many requests")
            }

            await RedisClient.hset(key, {
                count: data.count+1
            })
            next()

        } catch(error) {
            next(error)
        }
    }
}
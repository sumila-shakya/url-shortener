import { Request, Response, NextFunction } from "express";
import { RedisClient } from "../config/redis.config";
import { hashData } from "../utils/hashIp";
import { parseBrowser } from "../utils/userAgentParser";
import { analyticsEvent } from "../@types/interface";
import { analyticslogQueue } from "../queue/queue";

export const cacheCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shortCode = req.params.shortCode as string
            
        const longUrl = await RedisClient.get(shortCode)

        if(longUrl) {
            console.log("redis cached")

            //default 302 http status code
            res.redirect(longUrl)

            const logData: analyticsEvent = {
                short_code: shortCode,
                timestamp: new Date(),
                ip_address: hashData(req.ip || 'unknown'),
                user_agent: req.headers['user-agent'],
                browser: parseBrowser(req.headers['user-agent'])
            }
            
            // send the log data to the queue for porcessing in the background
            await analyticslogQueue.add('log-click', logData, {
                attempts: 5,
                backoff: { type:'exponential', delay: 1000},
                removeOnComplete: true
            })
        } else {
            next()
        }
    } catch(error) {
        next(error)
    }
}

import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { RedisClient } from "../config/redis.config";
import { shortCodeSchema, shortCodeType } from "../utils/validator";
import { analyticsEmitter } from "../events/analyticsEvents";
import { hashData } from "../utils/hashIp";
import { parseBrowser } from "../utils/userAgentParser";

export const cacheCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shortCode: shortCodeType = shortCodeSchema.parse(req.params.shortCode)
            
        const longUrl = await RedisClient.get(shortCode)

        if(longUrl) {
            //asynchronous logging
            analyticsEmitter.emit('url_clicked', {
                short_code: shortCode,
                timestamp: new Date(),
                ip_address: hashData(req.ip || 'unknown'),
                user_agent: req.headers['user-agent'],
                browser: parseBrowser(req.headers['user-agent'])
            })

            console.log(longUrl)

            //default 302 http status code
            return res.redirect(longUrl)
        } else {
            next()
        }
    } catch(error) {
        next(error)
    }
}

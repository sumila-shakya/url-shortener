import { Request, Response, NextFunction } from "express";
import { reqSchema, shortCodeSchema, reqType, shortCodeType } from "../utils/validator";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { ZodError } from "zod";
import { urlServices } from "../services/urlServices";
import { analyticsEmitter } from "../events/analyticsEvents";
import { hashData } from "../utils/hashIp";
import { parseBrowser } from "../utils/userAgentParser";

export const urlControllers = {
    async createUrl(req: Request, res: Response, next: NextFunction) {
        try{
            //validate data
            const validatedData: reqType = reqSchema.parse(req.body)

            //create short code
            const data = await urlServices.createShortUrl(validatedData)

            //response 201 created
            return res.status(201)
            .json(new ApiResponse(201, data, "Url shortened successfully"))
        } catch(error) {
            next(error)
        }
    },

    async redirectUrl(req: Request, res: Response, next: NextFunction) {
        try {
            //validate user input
            const shortCode: shortCodeType = shortCodeSchema.parse(req.params.shortCode)

            //get long url
            const linkData = await urlServices.getLongUrl(shortCode)
            
            //asynchronous logging
            analyticsEmitter.emit('url_clicked', {
                short_code: shortCode,
                timestamp: new Date(),
                ip_address: hashData(req.ip || 'unknown'),
                user_agent: req.headers['user-agent'],
                browser: parseBrowser(req.headers['user-agent'])
            })

            //default 302 http status code
            return res.redirect(linkData.longUrl)

        }catch(error) {
            next(error)
        }
    },

    async getAnalytics(req: Request, res: Response, next: NextFunction) {
        try {
            //validate input data
            const shortCode: shortCodeType = shortCodeSchema.parse(req.params.shortCode)

            //get analytics report
            const report = await urlServices.getAnalytics(shortCode)

            return res
            .status(200)
            .json(new ApiResponse(200, report))
        } catch(error) {
            next(error)
        }
    }
}
import { Request, Response } from "express";
import { reqSchema, shortCodeSchema } from "../utils/validator";
import { ZodError } from "zod";
import { urlServices } from "../services/urlServices";
import { analyticsEmitter } from "../events/analyticsEvents";
import { hashData } from "../utils/hashIp";

export const urlControllers = {
    async createUrl(req: Request, res: Response) {
        try{
            //validate data
            const validatedData = reqSchema.parse(req.body)

            //create short code
            const url = await urlServices.createShortUrl(validatedData.longUrl)

            //build url
            const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`
            const shortUrl = `${baseUrl}/${url.shortCode}`

            //response 201 created
            return res.status(201).json({
                success: true,
                data: {
                    id: url.id,
                    shortUrl: shortUrl,
                    longUrl: url.longUrl,
                    createdAt: url.createdAt,
                    clicks: url.clicks
                }
            })
        } catch(error) {
            if(error instanceof ZodError) {
                console.log(error.issues)
                return res.status(400).json({
                    success: false,
                    error: "Input validation failed",
                    detail: error.issues
                })
            }
            if(error instanceof Error && error.message.includes('Please try again')) {
                return res.status(503).json({
                    success: false,
                    error: error.message
                })
            }
            console.log("Error: ",error)
            res.status(500).json({
                success: false,
                error: "Internal server error"
            })
        }
    },

    async redirectUrl(req: Request, res: Response) {
        try {
            const shortCode = shortCodeSchema.parse(req.params.shortCode)

            const linkData = await urlServices.getLongUrl(shortCode)
            
            analyticsEmitter.emit('url_clicked', {
                short_code: shortCode,
                timestamp: new Date(),
                ip_address: hashData(req.ip || 'unknown'),
                user_agent: req.headers['user-agent']
            })

            //default 302 http status code
            return res.redirect(linkData.longUrl)

        }catch(error) {
            if(error instanceof ZodError) {
                console.log(error.issues)
                return res.status(400).json({
                    success: false,
                    error: "Validation failed",
                    detail: error.issues
                })
            }
            if(error instanceof Error && error.message.includes('Url not Found')) {
                return res.status(404).json({
                    success: false,
                    error: error.message
                })
            }
            console.log("Error: ",error)
            res.status(500).json({
                success: false,
                error: "Internal server error"
            })
        }
    },
}
import { db } from "../config/mysql.config";
import { urls, Url, NewUrl } from "../db/mysql.model";
import { Analytics } from "../db/mongodb.model";
import { eq } from "drizzle-orm";
import { generateShortCode } from "../utils/shortCode";
import { shortCodeType, reqType } from "../utils/validator";
import { ApiError } from "../utils/apiError";
import { RedisClient } from "../config/redis.config";

export const urlServices = {
    async createShortUrl(reqData: reqType) {
        const { longUrl, slug } = reqData
        const MAX_RETRY = 3
        let shortCode = slug || ''
        if(!slug) {
            for(let attempt = 0; attempt < MAX_RETRY; attempt++) {
                //generate short code
                shortCode = generateShortCode()

                //database lookup for existing short_code
                const existing: Url[] = await db
                .select()
                .from(urls)
                .where(eq(urls.shortCode, shortCode))
                .limit(1)

                if(existing.length === 0) {
                    break;
                }

                if(attempt === MAX_RETRY-1) {
                    throw new ApiError(503, "Failed to generate unique short code. Please try again")
                }
            }
        }
        else {
            const existing: Url[] = await db
            .select()
            .from(urls)
            .where(eq(urls.shortCode, slug))
            .limit(1)
            
            if(existing.length > 0) {
                throw new ApiError(409, "Slug already taken")
            }
        }

        const newUrl: NewUrl = {
            shortCode,
            longUrl,
            clicks: 0
        }

        //insert short code, long url mapping to database
        const [result] = await db
        .insert(urls)
        .values(newUrl)

        const [insertedUrl] = await db
        .select()
        .from(urls)
        .where(eq(urls.id, result.insertId))

        //build url
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`
        const shortUrl = `${baseUrl}/${insertedUrl.shortCode}`
        
        const data = {
            id: insertedUrl.id,
            shortUrl: shortUrl,
            longUrl: insertedUrl.longUrl,
            createdAt: insertedUrl.createdAt,
            clicks: insertedUrl.clicks,
        }
        
        return data
    }
    ,

    async getLongUrl(shortCode: shortCodeType): Promise<Url> {
        //get the long url
        const [linkData]: Url[] = await db
        .select()
        .from(urls)
        .where(eq(urls.shortCode,shortCode))
        .limit(1)

        if(!linkData) {
            throw new ApiError(404, "Url not Found")
        }

        await RedisClient.set(shortCode, linkData.longUrl, 'EX', 2*60)

        return linkData
    }
    ,

    async getAnalytics(shortCode: shortCodeType) {
        //get link data
        const linkData: Url = await this.getLongUrl(shortCode)

        //mongodb aggregation pipeline
        const [uniqueUser, clicksByDay, browserDistribution] = await Promise.all([
            Analytics.aggregate([
                {$match:{short_code: shortCode}},
                {$group:{_id: "$ip_address"}},
                {$count:"unique_users"}
            ]),
            Analytics.aggregate([
                {$match:{short_code: shortCode}},
                {$group:{
                    _id:{
                        $dateToString:{
                            format:"%Y-%m-%d",
                            date:"$timestamp"
                        }
                    },
                    count:{$sum:1}
                }},
                {$sort:{_id:-1}},
                {$limit: 30}
            ]),
            Analytics.aggregate([
                {$match:{short_code: shortCode}},
                {$group:{
                    _id: "$browser",
                    count: {$sum:1}
                }}
            ])
        ])
        
        return {
            shortCode: linkData.shortCode,
            originalUrl: linkData.longUrl,
            analytics: {
                totalClickCount: linkData.clicks,
                uniqueUsers: uniqueUser[0]?.unique_users || 0,
                clicksByDay: clicksByDay.map((data)=> {
                    return {
                        date: data._id,
                        clicks: data.count
                    }
                }),
                browserDistribution: browserDistribution.map((data)=> {
                    return {
                        browser: data._id,
                        clicks: data.count
                    }
                })
            }
        }

    }
}
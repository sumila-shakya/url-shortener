import { db } from "../config/mysql";
import { urls, Url, NewUrl } from "../db/mysqlSchema";
import { eq } from "drizzle-orm";
import { generateShortCode } from "../utils/shortCode";


export const urlServices = {
    async createShortUrl(longUrl: string): Promise<Url> {
        const MAX_RETRY = 3
        let shortCode = ''
        for(let attempt = 0; attempt < MAX_RETRY; attempt++) {
            shortCode = generateShortCode()

            //database lookup fro existing short_code
            const existing = await db.select()
            .from(urls)
            .where(eq(urls.shortCode, shortCode))
            .limit(1)

            if(existing.length === 0) {
                break;
            }

            if(attempt === MAX_RETRY-1) {
                throw new Error("Failed to generate unique short code. Please try again")
            }
        }
        const [result] = await db.insert(urls).values({
            shortCode,
            longUrl,
            clicks: 0
        })

        const [newUrl] = await db.select()
        .from(urls)
        .where(eq(urls.id,result.insertId))

        return newUrl
    }
    ,
}
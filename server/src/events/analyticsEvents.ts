import { EventEmitter } from "events";
import { logAnalytics, analyticsEvent } from "../services/loggerServices";
import { db } from "../config/mysql";
import { urls } from "../db/mysqlSchema";
import { sql, eq } from "drizzle-orm";

export const analyticsEmitter = new EventEmitter()

//define the event listener
analyticsEmitter.on('url_clicked', async (log_info: analyticsEvent)=> {
    try {
        //update clicks
        await db.update(urls)
        .set({clicks: sql`${urls.clicks} + 1`})
        .where(eq(urls.shortCode,log_info.short_code))
        .execute()

        //log the click data
        await logAnalytics(log_info)

        console.log(`Logging tasks completed for: ${log_info.short_code}`)
    } catch(error) {
        console.error("Error: ", {
            code: log_info.short_code,
            message: error instanceof Error ? error.message: error
        })
    }
})
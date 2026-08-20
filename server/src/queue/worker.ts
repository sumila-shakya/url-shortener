import { Worker, Job } from "bullmq";
import { RedisClient } from "../config/redis.config";
import { logAnalytics } from "../services/logger.service";
import { analyticsEvent } from "../@types/interface";
import { db } from "../config/mysql.config";
import { urls } from "../db/mysql.model";
import { sql, eq } from "drizzle-orm";

export const analyticsWorker = new Worker<analyticsEvent>(
    'analytics_log_queue',
    async (job: Job<analyticsEvent>) => {
        await db.update(urls)
        .set({clicks: sql`${urls.clicks} + 1`})
        .where(eq(urls.shortCode,job.data.short_code))
        .execute()
        
        //log the click data
        await logAnalytics(job.data)
    },
    {
        connection: RedisClient
    }
)

analyticsWorker.on('completed', (job: Job) => {
    console.log(`Logging tasks completed for: ${job.data.short_code}`)
})

analyticsWorker.on('failed', (job, error) => {
    console.error("Error: ", {
        jobId: job?.id,
        message: error.message
    })
})
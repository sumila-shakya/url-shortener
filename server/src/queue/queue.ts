import { Queue } from "bullmq";
import { RedisClient } from "../config/redis.config";
import { analyticsEvent } from "../@types/interface";

export const analyticslogQueue = new Queue<analyticsEvent>('analytics_log_queue', {
    connection: RedisClient
})
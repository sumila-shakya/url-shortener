import { Analytics } from "../db/mongodb.model";
import { analyticsEvent } from "../@types/interface";

//log into the MongoDb database
export const logAnalytics = async(log_info:analyticsEvent): Promise<void>=> {
    try{
        await Analytics.create(log_info)
    } catch(error) {
        console.error("Error: ", {
            code: log_info.short_code,
            message: error instanceof Error ? error.message: error
        })
    }
}
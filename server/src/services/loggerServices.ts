import { Analytics } from "../db/mongodbSchema";

export interface analyticsEvent {
    short_code: string,
    timestamp: Date,
    ip_address?: string,
    user_agent?: string,
    browser: string 
}

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
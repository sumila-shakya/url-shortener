import { Analytics } from "../db/mongodbSchema";

export interface analyticsEvent {
    short_code: string,
    timestamp: Date,
    ip_address?: string,
    user_agent?: string 
}

export const logAnalytics = async(log_info:analyticsEvent)=> {
    try{
        await Analytics.create(log_info)
    } catch(error) {
        console.error("Error: ", {
            code: log_info.short_code,
            message: error instanceof Error ? error.message: error
        })
    }
}
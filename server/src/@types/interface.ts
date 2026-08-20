import { Document } from "mongoose"

export interface analyticsEvent {
    short_code: string,
    timestamp: Date,
    ip_address?: string,
    user_agent?: string,
    browser: string 
}

export interface IAnalytics extends Document {
    short_code: string,
    timestamp: Date,
    ip_address?: string,
    user_agent?: string,
    browser: string 
}
import mongoose, {Document} from "mongoose";

export interface IAnalytics extends Document {
    short_code: string,
    timestamp: Date,
    ip_address?: string,
    user_agent?: string,
    browser: string 
}

const analyticsSchema = new mongoose.Schema({
    short_code: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
    },
    ip_address: {
        type: String,
        required: false
    },
    user_agent: {
        type: String,
        required: false
    },
    browser: {
        type: String,
        required: true,
        index: true
    }
})

analyticsSchema.index({short_code: 1, timestamp: -1})

export const Analytics = mongoose.model<IAnalytics>('Analytics', analyticsSchema)
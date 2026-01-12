import mongoose from "mongoose";

export const connectMongoDb = async(): Promise<void> => {
    try {
        const connection_obj = await mongoose.connect(process.env.MONGODB_URL as string)
    } catch(error) {
        console.log(error)
    }
}
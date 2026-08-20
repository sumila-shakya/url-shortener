import 'dotenv/config'
import express from "express";
import { db } from "./config/mysql.config";
import { RedisClient } from './config/redis.config';
import { errorHandler } from './middleware/error.middleware';
import mongoose from "mongoose";
import router from './routes/url.route';
import { ApiResponse } from './utils/apiResponse';

const app = express()

// EXPRESS GLOBAL MIDDLEWARES
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// URL ROUTES 
app.use('',router)

//database connection check
app.get('/api/health', async (req, res, next)=> {
    try {
        
        //simulating the error to test the global error middleware
        throw new Error("Simulated Crash")
        
        //test database conection
        const mongodbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
        await db.execute('SELECT 1')

        //test database schema
        //await db.select().from(urls).limit(1)
        //await Analytics.countDocuments()

        const healthData = {
            server:"UP",
            mysql: "Connected",
            redis: RedisClient.status === 'ready' ? "Connected": "Disconnected",
            mongodb: mongodbStatus,
            timestamp: new Date()
        }
        
        res
        .status(200)
        .json(new ApiResponse(200, healthData))
    } catch(error) {
        next(error)
    }
})

// GLOBAL ERROR MIDDLEWARE
app.use(errorHandler)

export { app }
import 'dotenv/config'
import express from "express";
import { db } from "./config/mysql";
import { connectMongoDb } from "./config/mongodb";
import { Analytics } from './db/mongodbSchema';
import { urls } from './db/mysqlSchema';
import { RedisClient } from './config/redis.config';
import { errorHandler } from './middleware/errorMiddleware';
import mongoose from "mongoose";
import router from './routes/urlRoutes';
import { ApiResponse } from './utils/apiResponse';

const app = express()
const PORT = process.env.PORT || 3000

//handle json data
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//url route
app.use('',router)

const startServer = async ()=> {
    try {
        console.log("Starting Server...")

        //start the mongodb connection
        await connectMongoDb()
        console.log("MongoDb connected.")

        //testing the mysql pool connection
        await db.execute('SELECT 1')
        console.log("MySQL connected")

        // connect to redis
        //await RedisClient.connect()
        //console.log("Redis connected successfully")

        app.listen(PORT,()=> {
            console.log(`The server is runnig in port ${PORT}`)
        })
    } catch(error) {
        if(error instanceof Error) {
            console.log(error.message)
        }
        console.log("Failed to start the server:", error)
        process.exit(1)
    }
}

//database connection check
app.get('/api/health', async (req, res, next)=> {
    try {
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

app.use(errorHandler)

//start server
startServer()
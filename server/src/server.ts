import 'dotenv/config'
import express from "express";
import { db } from "./config/mysql";
import { connectMongoDb } from "./config/mongodb";
import { Analytics } from './db/mongodbSchema';
import { urls } from './db/mysqlSchema';
import mongoose from "mongoose";

const app = express()
const PORT = process.env.PORT || 3000


const startServer = async ()=> {
    try {
        console.log("Starting Server...")

        //start the mongodb connection
        await connectMongoDb()
        console.log("MongoDb connected.")

        //testing the mysql pool connection
        await db.execute('SELECT 1')
        console.log("MySQL connected")

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
app.get('/api/health', async (req, res)=> {
    try {
        //test database conection
        const mongodbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
        await db.execute('SELECT 1')

        //test database schema
        await db.select().from(urls).limit(1)
        await Analytics.countDocuments()
        
        res.status(200).json({
            status:"ok",
            message: "server is running",
            mysql: "connected",
            mongodb: mongodbStatus
        })
    } catch(error) {
        res.status(500).json({
            status:"error",
            message: error instanceof Error? error.message: "Database connection failed"
        })
    }
})

startServer()
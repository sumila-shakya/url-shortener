import express from "express";
import 'dotenv/config'
import { db } from "./config/mysql";
import { connectMongoDb } from "./config/mongodb";

const app = express()
const PORT = process.env.PORT || 3000


//database connection check
app.get('/api/health', async (req, res)=> {
    try {
        await connectMongoDb()
        await db.execute('SELECT 1')
        res.json({
            status:"ok",
            message: "server is running",
            mysql: "connected",
            mongodb: "connected"
        })
    } catch(error) {
        res.status(500).json({
            status:"error",
            message: "Database connection failed"
        })
    }
})

app.listen(PORT,()=> {
    console.log(`The server is runnig in port ${PORT}`)
})
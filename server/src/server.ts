import 'dotenv/config'
import { db } from "./config/mysql.config";
import { connectMongoDb } from "./config/mongodb.config";
import { app } from './app';
import './queue/worker';

const PORT = process.env.PORT || 3000

const startServer = async ()=> {
    try {
        console.log("Starting Server...")

        //start the mongodb connection
        await connectMongoDb()
        console.log("MongoDb connected")

        //testing the mysql pool connection
        await db.execute('SELECT 1')
        console.log("MySQL connected")

        app.listen(PORT,()=> {
            console.log(`The server is running in port ${PORT}`)
        })
    } catch(error) {
        if(error instanceof Error) {
            console.log(error.message)
        }
        console.log("Failed to start the server:", error)
        process.exit(1)
    }
}

//start server
startServer()
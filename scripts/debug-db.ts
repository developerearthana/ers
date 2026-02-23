
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
    console.log("Testing DB Connection...");
    console.log("URI present:", !!MONGODB_URI);

    if (!MONGODB_URI) {
        console.error("MONGODB_URI is missing!");
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Mongoose connected successfully!");

        // List collections to verify access
        const db = mongoose.connection.db;
        if (db) {
            const collections = await db.listCollections().toArray();
            console.log("Collections:", collections.map(c => c.name));
        } else {
            console.warn("DB connection established but db object is undefined.");
        }

        await mongoose.disconnect();
        console.log("Disconnected.");
    } catch (error) {
        console.error("Connection failed:", error);
    }
}

testConnection();

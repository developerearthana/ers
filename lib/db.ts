import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// Global interface to prevent hot-reload connection leaks in development
declare global {
    var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: true,
            // Robust settings for Render cold-starts and serverless-like environments
            maxPoolSize: 10,          // max concurrent connections
            minPoolSize: 1,           // keep at least 1 alive
            serverSelectionTimeoutMS: 10000, // give up selecting server after 10s
            connectTimeoutMS: 10000,         // give up initial connection after 10s
            socketTimeoutMS: 45000,          // close sockets after 45s of inactivity
            heartbeatFrequencyMS: 10000,     // check server health every 10s
            family: 4,                       // force IPv4 (fixes DNS issues on some hosts)
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectToDatabase;

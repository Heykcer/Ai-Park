import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
            heartbeatFrequencyMS: 2000,      // Check server status every 2s
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('✅ MongoDB connected successfully');
            return mongoose;
        }).catch((err) => {
            console.error('❌ MongoDB connection error:', err.message);
            console.error('Full Error:', err);
            cached.promise = null; // Allow retry on next request
            throw err;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;

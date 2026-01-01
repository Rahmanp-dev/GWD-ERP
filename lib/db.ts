import mongoose from 'mongoose';



/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        console.warn("MONGODB_URI not defined, returning null connection.");
        return null; // Don't throw during build if secrets missing
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            // Longer timeouts for production stability, fail-fast for dev/build could be handled via envs
            connectTimeoutMS: 10000,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        }).catch((e) => {
            console.error("Mongoose Connect Error:", e);
            cached.promise = null; // Reset promise so we can retry
            return null;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        cached.conn = null;
    }

    return cached.conn;
}

export default dbConnect;

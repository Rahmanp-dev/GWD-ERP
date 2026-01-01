import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({
        hasMongoUri: !!process.env.MONGODB_URI,
        mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
        mongoUriPreview: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 15) + "..." : "undefined",
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nodeEnv: process.env.NODE_ENV,
    });
}

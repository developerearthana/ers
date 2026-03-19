import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';

/**
 * Health check endpoint - used by Render's health check pings
 * and also warms up the MongoDB connection on cold start.
 * This prevents the first user request from timing out.
 */
export async function GET() {
    try {
        await connectToDatabase();
        return NextResponse.json({ status: 'ok', db: 'connected', ts: Date.now() });
    } catch (error: any) {
        return NextResponse.json(
            { status: 'error', db: 'disconnected', error: error.message },
            { status: 503 }
        );
    }
}

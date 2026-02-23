import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Docker container health monitoring
 * Used by Docker HEALTHCHECK instruction
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

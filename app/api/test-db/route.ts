import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function GET() {
    try {
        console.log("Testing DB Connection...");
        await connectToDatabase();
        console.log("DB Connected.");

        const count = await User.countDocuments();
        console.log("User Count:", count);

        return NextResponse.json({ success: true, count, message: "DB Connection Successful" });
    } catch (error: any) {
        console.error("Test DB Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

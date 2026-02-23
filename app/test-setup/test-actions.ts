
'use server';

import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function testServerAction() {
    console.log("TEST: Server Action Invoked");
    try {
        const session = await auth();
        console.log("TEST: Session found:", session?.user?.email);
        return {
            message: "Server Action Works",
            serverTime: new Date().toISOString(),
            sessionUser: session?.user?.email || 'No Session'
        };
    } catch (e: any) {
        console.error("TEST: Server Action Error", e);
        return { error: e.message };
    }
}

export async function testDbAction() {
    console.log("TEST: DB Action Invoked");
    try {
        await connectToDatabase();
        const count = await User.countDocuments();
        console.log("TEST: User count:", count);
        return {
            success: true,
            userCount: count,
            dbState: 'Connected'
        };
    } catch (e: any) {
        console.error("TEST: DB Action Error", e);
        return { error: e.message };
    }
}

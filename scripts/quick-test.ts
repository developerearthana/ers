import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const TEST_USERS = [
    { email: 'superadmin@planrite.com', role: 'super-admin' },
    { email: 'admin@planrite.com', role: 'admin' },
    { email: 'manager@planrite.com', role: 'manager' },
    { email: 'staff@planrite.com', role: 'staff' },
    { email: 'vendor@planrite.com', role: 'vendor' },
    { email: 'client@planrite.com', role: 'customer' },
];

async function test() {
    console.log('LOGIN VERIFICATION TEST');
    console.log('========================');

    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('DB: Connected');

    const User = (await import('../models/User')).default;
    let passed = 0;
    let failed = 0;

    for (const t of TEST_USERS) {
        const user = await User.findOne({ email: t.email }).select('+password');
        if (!user) {
            console.log(`FAIL: ${t.email} - Not Found`);
            failed++;
            continue;
        }
        const match = await bcrypt.compare('password123', user.password || '');
        if (match && user.role === t.role) {
            console.log(`PASS: ${t.email} (${user.role})`);
            passed++;
        } else {
            console.log(`FAIL: ${t.email} - Password:${match}, Role:${user.role}`);
            failed++;
        }
    }

    console.log('========================');
    console.log(`RESULT: ${passed} passed, ${failed} failed`);
    console.log(failed === 0 ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED');

    await mongoose.disconnect();
}

test();

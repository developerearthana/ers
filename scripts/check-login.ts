import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

async function checkLogin() {
    try {
        // Dynamic imports to match seed script environment
        const connectToDatabase = (await import('../lib/db')).default;
        const User = (await import('../models/User')).default;

        await connectToDatabase();
        console.log('Connected to DB');

        const email = 'manager@planrite.com';
        const password = 'password123';

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log('User not found!');
            return;
        }

        console.log(`User found: ${user.email}, Role: ${user.role}`);
        console.log(`Password Hash: ${user.password}`);

        const match = await bcrypt.compare(password, user.password);
        console.log(`Password Match Result: ${match}`);

        if (match) {
            console.log('SUCCESS: Credentials are valid.');
        } else {
            console.log('FAILURE: Password mismatch.');
        }

    } catch (e) {
        console.error('Script Error:', e);
    } finally {
        await mongoose.disconnect();
    }
}

checkLogin();

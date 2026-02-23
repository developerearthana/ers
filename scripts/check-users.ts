import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import User from '../models/User';
import connectToDatabase from '../lib/db';

async function checkUsers() {
    try {
        await connectToDatabase();
        const users = await User.find({}).select('+password');

        console.log('--- Database Users ---');
        users.forEach(u => {
            console.log(`Email: ${u.email}`);
            console.log(`Role: ${u.role}`);
            console.log(`Name: ${u.name}`);
            console.log(`Password Hash Exists: ${!!u.password}`);
            console.log('-------------------');
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();

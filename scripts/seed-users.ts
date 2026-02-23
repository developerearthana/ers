import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

async function seedUsers() {
    try {
        // Dynamic imports to ensure env vars are loaded first
        const connectToDatabase = (await import('../lib/db')).default;
        const User = (await import('../models/User')).default;

        await connectToDatabase();
        console.log('Connected to DB');

        const passwordHash = await bcrypt.hash('password123', 10);

        const users = [
            {
                name: "Super Admin User",
                email: "superadmin@planrite.com",
                role: "super-admin",
                password: passwordHash,
                image: "https://github.com/shadcn.png"
            },
            {
                name: "Admin User",
                email: "admin@planrite.com",
                role: "admin",
                password: passwordHash,
                image: "https://github.com/shadcn.png"
            },
            {
                name: "Manager User",
                email: "manager@planrite.com",
                role: "manager",
                password: passwordHash,
                image: "https://github.com/shadcn.png"
            },
            {
                name: "Staff User",
                email: "staff@planrite.com",
                role: "staff",
                password: passwordHash,
                image: "https://github.com/shadcn.png" // Fixed generic avatar
            },
            {
                name: "Vendor User",
                email: "vendor@planrite.com",
                role: "vendor",
                password: passwordHash,
                image: "https://github.com/shadcn.png"
            },
            {
                name: "Client User",
                email: "client@planrite.com",
                role: "customer",
                password: passwordHash,
                image: "https://github.com/shadcn.png"
            }
        ];

        for (const u of users) {
            // Use updateOne with upsert to avoid validation errors on existing docs if schema changed slightly
            // actually findOneAndUpdate is fine if models line up
            await User.findOneAndUpdate(
                { email: u.email },
                { $set: u },
                { upsert: true, new: true }
            );
            console.log(`Seeded: ${u.email} (${u.role})`);
        }

        console.log('--- Seed Complete ---');

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

seedUsers();

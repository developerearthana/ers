const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        image: { type: String },
        role: { type: String, enum: ['user', 'admin', 'vendor', 'customer', 'super-admin', 'manager', 'staff'], default: 'user' },
        dept: { type: String, default: 'General' },
        status: { type: String, enum: ['Active', 'Inactive', 'On Leave'], default: 'Active' },
        jobTitle: { type: String },
        provider: { type: String, enum: ['credentials', 'google'], default: 'credentials' },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedUsers() {
    try {
        if (!MONGODB_URI) {
            console.error("Error: MONGODB_URI is undefined.");
            process.exit(1);
        }

        console.log("Connecting to DB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB.");

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
                image: "https://github.com/shadcn.png"
            }
        ];

        for (const u of users) {
            await User.findOneAndUpdate(
                { email: u.email },
                { $set: u },
                { upsert: true, new: true }
            );
            console.log(`Seeded: ${u.email} (${u.role})`);
        }

        console.log('--- Seed Complete ---');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seedUsers();

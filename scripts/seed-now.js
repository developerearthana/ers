const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI;
console.log('URI loaded:', uri ? 'YES' : 'NO');

async function seed() {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas!');

    const UserSchema = new mongoose.Schema(
        { name: String, email: { type: String, unique: true }, role: String, password: String, image: String },
        { strict: false }
    );
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    const hash = await bcrypt.hash('password123', 10);
    const users = [
        { name: 'Super Admin User', email: 'superadmin@planrite.com', role: 'super-admin', password: hash, image: 'https://github.com/shadcn.png' },
        { name: 'Admin User', email: 'admin@planrite.com', role: 'admin', password: hash, image: 'https://github.com/shadcn.png' },
        { name: 'Manager User', email: 'manager@planrite.com', role: 'manager', password: hash, image: 'https://github.com/shadcn.png' },
        { name: 'Staff User', email: 'staff@planrite.com', role: 'staff', password: hash, image: 'https://github.com/shadcn.png' },
        { name: 'Vendor User', email: 'vendor@planrite.com', role: 'vendor', password: hash, image: 'https://github.com/shadcn.png' },
        { name: 'Client User', email: 'client@planrite.com', role: 'customer', password: hash, image: 'https://github.com/shadcn.png' },
    ];

    for (const u of users) {
        await User.findOneAndUpdate({ email: u.email }, { $set: u }, { upsert: true, new: true });
        console.log('Seeded:', u.email, '(' + u.role + ')');
    }

    await mongoose.disconnect();
    console.log('--- Seed Complete ---');
}

seed().catch(console.error);

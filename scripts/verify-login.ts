import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Role from '../models/Role';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyLogin(email: string) {
    console.log(`\n🔍 Verifying login for: ${email}`);

    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI missing');
        return;
    }

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.error('❌ User not found');
            return;
        }

        console.log(`✅ User found: ${user.name} (${user.role})`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Has Password: ${!!user.password}`);

        // Verify Password
        const password = 'password123'; // Standard seed password
        const match = await bcrypt.compare(password, user.password || '');
        console.log(`   Password 'password123' match: ${match ? '✅ YES' : '❌ NO'}`);

        // Verify Custom Role
        if (user.customRole) {
            console.log(`   Custom Role ID: ${user.customRole}`);
            const role = await Role.findById(user.customRole);
            if (role) {
                console.log(`✅ Custom Role Found: ${role.name}`);
                console.log(`   Permissions: ${role.permissions.join(', ')}`);
            } else {
                console.error('❌ Custom Role Reference Broken (Role doc not found)');
            }
        } else {
            console.log('ℹ️ No customRole assigned');
        }

        // Verify Logic from auth.ts
        const internalRoles = ['admin', 'super-admin', 'manager', 'staff'];
        const selectedRole = 'admin'; // Simulating "Company Login"

        let logicCheck = false;
        if (selectedRole === 'admin' && internalRoles.includes(user.role)) {
            logicCheck = true;
        } else if (user.role === selectedRole) {
            logicCheck = true;
        }

        console.log(`   Auth Logic Check (selected='admin'): ${logicCheck ? '✅ PASS' : '❌ FAIL'}`);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

async function run() {
    await verifyLogin('manager@planrite.com');
    await verifyLogin('staff@planrite.com');
    process.exit(0);
}

run();

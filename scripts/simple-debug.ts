import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    if (!process.env.MONGODB_URI) {
        fs.writeFileSync('debug-result.json', JSON.stringify({ error: 'MONGODB_URI missing' }));
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const UserModule = await import('../models/User');
        const User = UserModule.default || UserModule;

        const email = 'superadmin@planrite.com';
        const user = await User.findOne({ email }).select('+password');

        const result: any = { timestamp: new Date().toISOString() };

        if (user) {
            const matchesPassword123 = await bcrypt.compare('password123', user.password || '');

            result.found = true;
            result.email = user.email;
            result.role = user.role;
            result.ipRestrictionEnabled = user.ipRestrictionEnabled;
            result.allowedIP = user.allowedIP;
            result.matchesPassword123 = matchesPassword123;
            result.passwordHashSample = user.password ? user.password.substring(0, 10) : 'none';
        } else {
            result.found = false;
            result.email = email;
        }

        fs.writeFileSync('debug-result.json', JSON.stringify(result, null, 2));
        console.log('Written detailed result to debug-result.json');

    } catch (e: any) {
        fs.writeFileSync('debug-result.json', JSON.stringify({ error: e.message, stack: e.stack }, null, 2));
    } finally {
        await mongoose.disconnect();
    }
}

main();

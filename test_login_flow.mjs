/**
 * Test script: simulates what the authenticate server action does
 * Run with: node --env-file=.env.local test_login_flow.mjs
 */
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('ERROR: MONGODB_URI not set');
    process.exit(1);
}

console.log('Connecting to MongoDB...');
const start = Date.now();

try {
    await mongoose.connect(MONGODB_URI, {
        maxPoolSize: 10,
        minPoolSize: 1,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,
    });
    console.log(`✅ Connected in ${Date.now() - start}ms`);
} catch (err) {
    console.error(`❌ Connection failed after ${Date.now() - start}ms:`, err.message);
    process.exit(1);
}

// Simulate what authenticate action does: find user by email
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String,
    status: String,
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const t1 = Date.now();
console.log('\nQuerying super-admin user...');
const users = await User.find({ role: { $in: ['super-admin', 'admin'] } }).select('name email role status').lean();
console.log(`✅ Query done in ${Date.now() - t1}ms`);
console.log(`Found ${users.length} super-admin/admin user(s):`);
users.forEach(u => console.log(`  - ${u.name} (${u.email}) [${u.role}] [${u.status}]`));

// Test leave query (what super-admin dashboard calls)
const LeaveSchema = new mongoose.Schema({ status: String, userId: String });
const LeaveRequest = mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', LeaveSchema);

const t2 = Date.now();
const leaves = await LeaveRequest.find({ status: 'Pending' }).lean();
console.log(`\n✅ LeaveRequest query: ${Date.now() - t2}ms - ${leaves.length} pending leave(s)`);

// Test KPI query  
const KPISchema = new mongoose.Schema({ title: String, status: String });
const KPIAssignment = mongoose.models.KPIAssignment || mongoose.model('KPIAssignment', KPISchema);

const t3 = Date.now();
const kpis = await KPIAssignment.find({}).lean();
console.log(`✅ KPIAssignment query: ${Date.now() - t3}ms - ${kpis.length} KPI(s)`);

console.log(`\nTotal time: ${Date.now() - start}ms`);
await mongoose.disconnect();
console.log('Done ✅');

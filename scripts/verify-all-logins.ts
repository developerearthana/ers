import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface TestResult {
    email: string;
    role: string;
    found: boolean;
    passwordMatch: boolean;
    expectedPermissions: string[];
}

const TEST_USERS = [
    { email: 'superadmin@planrite.com', role: 'super-admin', permissions: ['*'] },
    { email: 'admin@planrite.com', role: 'admin', permissions: ['*'] },
    { email: 'manager@planrite.com', role: 'manager', permissions: ['dashboard', 'sales', 'marketing', 'contacts', 'activity', 'goals'] },
    { email: 'staff@planrite.com', role: 'staff', permissions: ['dashboard', 'activity', 'contacts'] },
    { email: 'vendor@planrite.com', role: 'vendor', permissions: ['dashboard', 'purchase', 'vendor-dash'] },
    { email: 'client@planrite.com', role: 'customer', permissions: ['projects', 'customer-dash'] },
];

async function verifyAllLogins() {
    console.log('='.repeat(60));
    console.log('🔐 EARTHANA LOGIN VERIFICATION TEST');
    console.log('='.repeat(60));

    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI missing');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Database connected\n');

        const User = (await import('../models/User')).default;
        const Role = (await import('../models/Role')).default;

        const results: TestResult[] = [];
        let allPassed = true;

        for (const testUser of TEST_USERS) {
            console.log(`\n📧 Testing: ${testUser.email}`);
            console.log('-'.repeat(40));

            const user = await User.findOne({ email: testUser.email }).select('+password');
            
            if (!user) {
                console.error(`   ❌ User NOT FOUND`);
                results.push({
                    email: testUser.email,
                    role: testUser.role,
                    found: false,
                    passwordMatch: false,
                    expectedPermissions: testUser.permissions
                });
                allPassed = false;
                continue;
            }

            console.log(`   ✅ User found: ${user.name}`);
            console.log(`   👤 Role: ${user.role}`);

            // Role check
            if (user.role === testUser.role) {
                console.log(`   ✅ Role matches expected: ${testUser.role}`);
            } else {
                console.log(`   ❌ Role mismatch! Expected: ${testUser.role}, Got: ${user.role}`);
                allPassed = false;
            }

            // Password check
            const passwordMatch = await bcrypt.compare('password123', user.password || '');
            if (passwordMatch) {
                console.log(`   ✅ Password verified`);
            } else {
                console.log(`   ❌ Password verification FAILED`);
                allPassed = false;
            }

            // Custom role check
            if (user.customRole) {
                const role = await Role.findById(user.customRole);
                if (role) {
                    console.log(`   🎭 Custom Role: ${role.name}`);
                    console.log(`   📋 Permissions: ${role.permissions.join(', ')}`);
                }
            } else {
                console.log(`   📋 Default permissions for ${user.role}: ${testUser.permissions.join(', ')}`);
            }

            results.push({
                email: testUser.email,
                role: user.role,
                found: true,
                passwordMatch: passwordMatch,
                expectedPermissions: testUser.permissions
            });
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(60));
        
        console.log('\n| Email | Role | Found | Password |');
        console.log('|-------|------|-------|----------|');
        for (const r of results) {
            const foundIcon = r.found ? '✅' : '❌';
            const passIcon = r.passwordMatch ? '✅' : '❌';
            console.log(`| ${r.email} | ${r.role} | ${foundIcon} | ${passIcon} |`);
        }

        console.log('\n' + '='.repeat(60));
        if (allPassed) {
            console.log('🎉 ALL TESTS PASSED - All users can login successfully!');
        } else {
            console.log('⚠️  SOME TESTS FAILED - Check results above');
        }
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

verifyAllLogins();

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User';
import Role from '../models/Role';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const STANDARD_ROLES = [
    {
        name: 'Super Admin',
        description: 'Full system access and configuration control.',
        permissions: ['*']
    },
    {
        name: 'Administrator',
        description: 'General system administration.',
        permissions: ['*']
    },
    {
        name: 'General Manager',
        description: 'Oversees all operations.',
        permissions: ['dashboard', 'sales', 'marketing', 'contacts', 'activity', 'goals', 'projects', 'work-orders', 'accounting', 'purchase', 'inventory', 'hrm', 'assets', 'masters']
    },
    {
        name: 'Operations Manager',
        description: 'Manages daily operations and staff.',
        permissions: ['dashboard', 'projects', 'work-orders', 'inventory', 'assets', 'activity']
    },
    {
        name: 'Sales Manager',
        description: 'Lead for sales and marketing teams.',
        permissions: ['dashboard', 'sales', 'marketing', 'contacts', 'goals']
    },
    {
        name: 'Standard Staff',
        description: 'General employee access.',
        permissions: ['dashboard', 'activity', 'contacts']
    },
    {
        name: 'Project Manager',
        description: 'Manages projects and site execution.',
        permissions: ['dashboard', 'projects', 'work-orders', 'inventory']
    },
    {
        name: 'Site Supervisor',
        description: 'On-site supervision and reporting.',
        permissions: ['projects', 'work-orders', 'activity']
    },
    {
        name: 'Accountant',
        description: 'Financial management and auditing.',
        permissions: ['dashboard', 'accounting', 'purchase', 'inventory']
    },
    {
        name: 'Vendor',
        description: 'External vendor portal access.',
        permissions: ['purchase', 'vendor-dash']
    },
    {
        name: 'Customer',
        description: 'External customer portal access.',
        permissions: ['projects', 'customer-dash']
    }
];

const USER_MAPPING: Record<string, string> = {
    'superadmin@planrite.com': 'Super Admin',
    'admin@planrite.com': 'Administrator',
    'manager@planrite.com': 'Operations Manager',
    'staff@planrite.com': 'Standard Staff',
    'vendor@planrite.com': 'Vendor',
    'customer@planrite.com': 'Customer'
};

async function migrate() {
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI not found');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Create/Ensure Roles exist
        console.log('🔄 Syncing Roles...');
        const roleMap: Record<string, any> = {};

        for (const roleDef of STANDARD_ROLES) {
            const role = await Role.findOneAndUpdate(
                { name: roleDef.name },
                {
                    name: roleDef.name,
                    description: roleDef.description,
                    permissions: roleDef.permissions
                },
                { upsert: true, new: true }
            );
            roleMap[roleDef.name] = role;
            console.log(`   - Ensured Role: ${role.name}`);
        }

        // 2. Update Users
        console.log('\n🔄 Linking Users to Roles...');
        const users = await User.find({});

        for (const user of users) {
            // Check if hardcoded mapping exists
            const targetRoleName = USER_MAPPING[user.email];

            if (targetRoleName) {
                const targetRole = roleMap[targetRoleName];
                if (targetRole) {
                    user.customRole = targetRole._id;

                    // Keep base role string for purely legacy reasons (next-auth types) or align it?
                    // auth.ts logic: if (user.customRole) load permissions from DB.
                    // So updating customRole is sufficient.

                    await user.save();
                    console.log(`   - Linked ${user.email} -> ${targetRoleName}`);
                }
            } else {
                console.log(`   - Skipped ${user.email} (No mapping defined)`);
            }
        }

        console.log('\n🎉 Migration completed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();

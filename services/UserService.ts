import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { sanitizeObject } from '@/lib/sanitize';

export interface UserData {
    name: string;
    email: string;
    role: string;
    dept: string;
    status: string;
    jobTitle?: string;
    customRole?: string;
    customPermissions?: string[];
}

export class UserService {
    /**
     * Get all users
     */
    async getAllUsers() {
        await connectToDatabase();
        const users = await User.find({})
            .select('name email role dept status jobTitle image salaryStructure customRole customPermissions')
            .lean();

        return JSON.parse(JSON.stringify(users)).map((user: any) => ({
            ...user,
            id: user._id.toString()
        }));
    }

    /**
     * Get users by department
     */
    async getUsersByDept(dept: string) {
        await connectToDatabase();
        const users = await User.find({ dept })
            .select('name email role dept status jobTitle customRole customPermissions')
            .lean();

        return JSON.parse(JSON.stringify(users)).map((user: any) => ({
            ...user,
            id: user._id.toString()
        }));
    }

    /**
     * Update user details
     */
    async updateUser(id: string, data: Partial<UserData>) {
        await connectToDatabase();
        const sanitized = sanitizeObject(data);

        const user = await User.findByIdAndUpdate(
            id,
            { $set: sanitized },
            { new: true }
        ).lean();

        if (!user) throw new Error('User not found');

        return { ...JSON.parse(JSON.stringify(user)), id: user._id.toString() };
    }

    /**
     * Update user password
     */
    async updatePassword(id: string, password: string) {
        await connectToDatabase();
        // Dynamic import to avoid edge runtime issues if any (though standard bcryptjs is fine usually)
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findByIdAndUpdate(id, { password: hashedPassword });
    }
}

export const userService = new UserService();

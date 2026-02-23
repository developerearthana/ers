'use server';

import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { redirect } from 'next/navigation';

export async function registerUser(prevState: any, formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const mobile = formData.get('mobile') as string;

    if (mobile) {
        return { error: 'OTP functionality is mocked. Please use Email for now.', message: '' };
    }

    if (!name || !email || !password) {
        return { error: 'All fields are required', message: '' };
    }

    try {
        await connectToDatabase();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return { error: 'User already exists', message: '' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
        });
    } catch (err) {
        return { error: 'Failed to create user', message: '' };
    }

    redirect('/login');
}

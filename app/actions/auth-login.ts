'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

function getRoleRedirect(role: string): string {
    if (role === 'vendor') return '/dashboards/vendor';
    if (role === 'customer') return '/dashboards/customer';
    if (role === 'manager') return '/dashboards/manager';
    if (role === 'staff' || role === 'user' || role === 'employee') return '/dashboards/employee';
    if (role === 'super-admin' || role === 'admin') return '/dashboards/super-admin';
    return '/dashboards/employee';
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
): Promise<string> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return 'Please enter your email and password.';
    }

    // 1. Get the user role before signIn to know where to redirect
    let redirectUrl = '/dashboards/employee';
    try {
        await connectToDatabase();
        const user = await User.findOne({ email }).select('role').lean() as any;
        if (user?.role) {
            redirectUrl = getRoleRedirect(user.role);
        }
    } catch {
        // fallback to employee dashboard
    }

    // 2. Sign in — this validates password via bcrypt
    try {
        await signIn('credentials', {
            email,
            password,
            redirect: false,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid email or password.';
                default:
                    return 'Something went wrong. Please try again.';
            }
        }
        // If it's a NEXT_REDIRECT, re-throw so Next.js handles it
        const err = error as any;
        if (err?.digest?.includes('NEXT_REDIRECT') || err?.message?.includes('NEXT_REDIRECT')) {
            throw error;
        }
        return 'Something went wrong.';
    }

    // 3. Return a special marker so the client knows where to go
    // This avoids calling redirect() server-side which causes 502 on Render
    return `REDIRECT:${redirectUrl}`;
}

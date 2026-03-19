'use server';

import { signIn } from '@/auth';
import { redirect } from 'next/navigation';
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
) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return 'Please enter your email and password.';
    }

    // 1. Look up the user role BEFORE signIn so we know where to redirect
    //    This avoids calling auth() after signIn (double DB round-trip = 502 risk)
    let redirectUrl = '/dashboards/employee';
    try {
        await connectToDatabase();
        const user = await User.findOne({ email }).select('role').lean() as any;
        if (user?.role) {
            redirectUrl = getRoleRedirect(user.role);
        }
    } catch {
        // If DB lookup fails, we'll fall back to employee dashboard after signIn
    }

    // 2. Sign in
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
        // Re-throw NEXT_REDIRECT (thrown by Next.js on successful redirect)
        const err = error as any;
        if (err?.digest?.includes('NEXT_REDIRECT') || err?.message?.includes('NEXT_REDIRECT')) {
            throw error;
        }
        return 'Something went wrong.';
    }

    // 3. Redirect to the determined destination
    redirect(redirectUrl);
}

'use server';

import { signIn } from '@/auth';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        // Sign in with redirect:false so we can handle routing ourselves
        await signIn('credentials', {
            ...Object.fromEntries(formData),
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

    // After successful sign-in, read the session and redirect based on role
    const session = await auth();
    const role = session?.user?.role;

    if (role === 'vendor') redirect('/dashboards/vendor');
    else if (role === 'customer') redirect('/dashboards/customer');
    else if (role === 'manager') redirect('/dashboards/manager');
    else if (role === 'staff' || role === 'user') redirect('/dashboards/employee');
    else if (role === 'super-admin') redirect('/dashboards/super-admin');
    else redirect('/dashboards/super-admin'); // fallback for admin
}

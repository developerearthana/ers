'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', { ...Object.fromEntries(formData), redirectTo: '/' });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    console.error('Auth Error Type:', error.type);
                    console.error('Auth Error Message:', error.message);
                    console.error('Full Error:', error);
                    return `Error: ${error.message}`;
            }
        }
        const err = error as any;
        const isRedirect = err.message === 'NEXT_REDIRECT' || (err.digest && err.digest.toString().includes('NEXT_REDIRECT')) || (err.message && err.message.includes('NEXT_REDIRECT'));
        if (isRedirect) {
            throw error;
        }
        console.error('Auth Error:', error);
        return 'Something went wrong.';
    }
}

export async function googleSignIn() {
    await signIn('google', { redirectTo: '/' });
}


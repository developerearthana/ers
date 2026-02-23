"use client"

import { registerUser } from '@/app/actions/auth';
import Link from 'next/link';
import { useState } from 'react';
import { useFormState } from 'react-dom';

const initialState = {
    error: '',
    message: '',
};

export default function RegisterPage() {
    const [useOtp, setUseOtp] = useState(false);
    // @ts-ignore - Ignoring type mismatch for now to pass build, will refine types later
    const [state, dispatch] = useFormState(registerUser, initialState);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md space-y-8 p-8 glass-card rounded-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Earthana</h2>
                    <p className="mt-2 text-sm text-gray-600">Create your account</p>
                </div>

                <div className="flex justify-center mb-4">
                    <button
                        type="button"
                        onClick={() => setUseOtp(false)}
                        className={`text-xs px-3 py-1 rounded-l-md border ${!useOtp ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}
                    >
                        Email
                    </button>
                    <button
                        type="button"
                        onClick={() => setUseOtp(true)}
                        className={`text-xs px-3 py-1 rounded-r-md border ${useOtp ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}
                    >
                        Mobile OTP
                    </button>
                </div>

                <form className="mt-8 space-y-6" action={dispatch}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                            />
                        </div>

                        {!useOtp ? (
                            <>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                    />
                                </div>
                            </>
                        ) : (
                            <div>
                                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                                <input
                                    id="mobile"
                                    name="mobile"
                                    type="tel"
                                    required
                                    placeholder="+1234567890"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                />
                                <p className="text-xs text-muted-foreground mt-1">OTP will be sent to this number (Mock)</p>
                            </div>
                        )}
                    </div>

                    {state?.error && (
                        <p className="text-sm text-red-500 text-center">{state.error}</p>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                        >
                            {useOtp ? 'Send OTP' : 'Sign up'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-500">Already have an account? </span>
                    <Link href="/login" className="font-semibold text-primary hover:text-green-600">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}

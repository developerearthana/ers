"use client"

import { useActionState } from 'react';
import { authenticate } from '@/app/actions/auth-login';
import { Logo } from '@/components/ui/logo';

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8 p-8 glass-card rounded-xl border border-border shadow-2xl">
                <div className="text-center">
                    <div className="flex flex-col items-center justify-center gap-4 mb-8 w-full">
                        <Logo variant="full" className="h-20 sm:h-24 w-full max-w-[300px]" />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Sign in to your organization's portal</p>
                </div>

                <form className="mt-8 space-y-5" action={dispatch}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                className="block w-full rounded-lg border border-border px-3 py-2.5 bg-background text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
                                placeholder="you@company.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                className="block w-full rounded-lg border border-border px-3 py-2.5 bg-background text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3" aria-live="polite">
                            <p className="text-sm text-destructive">{errorMessage}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex w-full justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Signing in...
                            </span>
                        ) : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}

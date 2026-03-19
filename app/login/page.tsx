"use client"

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Logo } from '@/components/ui/logo';
import { useRouter } from 'next/navigation';

function getRoleRedirect(role: string): string {
    if (role === 'vendor') return '/dashboards/vendor';
    if (role === 'customer') return '/dashboards/customer';
    if (role === 'manager') return '/dashboards/manager';
    if (role === 'staff' || role === 'user' || role === 'employee') return '/dashboards/employee';
    if (role === 'super-admin' || role === 'admin') return '/dashboards/super-admin';
    return '/dashboards/employee';
}

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsPending(true);

        try {
            // Use next-auth/react signIn which goes through /api/auth/* routes
            // This avoids the server action 502 issue on Render
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password.');
                return;
            }

            if (result?.ok) {
                // Fetch the session to get role for redirect
                const sessionRes = await fetch('/api/auth/session');
                const session = await sessionRes.json();
                const role = session?.user?.role || 'staff';
                
                // Force a hard reload to clear Next.js client-side router cache 
                // and guarantee the dashboard components fetch their fresh server data
                window.location.href = getRoleRedirect(role);
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8 p-8 glass-card rounded-xl border border-border shadow-2xl">
                <div className="text-center">
                    <div className="flex flex-col items-center justify-center gap-4 mb-8 w-full">
                        <Logo variant="full" className="h-20 sm:h-24 w-full max-w-[300px]" />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Sign in to your organization's portal</p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
                                value={email}
                                onChange={e => setEmail(e.target.value)}
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
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="current-password"
                                className="block w-full rounded-lg border border-border px-3 py-2.5 bg-background text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3" aria-live="polite">
                            <p className="text-sm text-destructive">{error}</p>
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

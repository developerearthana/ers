"use client";

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { Logo } from '@/components/ui/logo';

/**
 * Root URL should always land on the login page as per user requirement.
 * We actively destroy any lingering session when hitting the root URL
 * to ensure users do not land directly into a "pre-logged-in" portal.
 */
export default function RootPage() {
    useEffect(() => {
        // ALWAYS clear the session when hitting the root URL, 
        // to strictly enforce the "always start with login page" rule.
        signOut({ callbackUrl: '/login' });
    }, []);

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <div className="animate-pulse flex flex-col items-center gap-6">
                <Logo variant="icon" className="h-16 w-16 opacity-50" />
                <p className="text-sm font-medium text-muted-foreground">Securing session...</p>
            </div>
        </div>
    );
}
